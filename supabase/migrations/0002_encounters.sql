-- MedPass LATAM — Phase 3: charge with consent
--
-- One encounter carries the whole interaction: what the provider asked for, what
-- the patient approved, until when, and how it was paid. Consent lives on the
-- encounter rather than in its own table because the relationship is strictly
-- 1:1 here — one charge, one approval. A separate consents table would add a
-- join and no expressiveness at this scope.
--
-- As in 0001, RLS is deny-by-default and ownership is enforced in the server
-- layer, which alone holds the service-role key.

-- The fields a provider may request. Naming them in the database rather than
-- accepting free text means an unknown field cannot be requested at all, and the
-- disclosure code has a closed set to reason about exhaustively.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'passport_field') then
    create type passport_field as enum (
      'blood_type',
      'allergies',
      'medications',
      'conditions',
      'emergency_contact'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'encounter_status') then
    create type encounter_status as enum (
      'requested',   -- provider opened the charge; nobody has answered
      'consented',   -- patient approved a scope; payment still outstanding
      'rejected',    -- patient declined
      'paid',        -- payment confirmed against this encounter
      'revoked'      -- patient withdrew access after granting it
    );
  end if;
end
$$;

create table if not exists public.encounters (
  id                   uuid primary key default gen_random_uuid(),

  -- What the QR carries. Random rather than the row id, so one QR cannot be
  -- guessed from another and the code carries no enumerable identifier.
  access_token         text not null unique,

  provider_profile_id  uuid not null references public.profiles(id) on delete cascade,
  -- Null until a patient scans and answers. The charge is addressed to whoever
  -- holds the QR, not to a patient the provider names — a provider never gets to
  -- assert who the patient is.
  patient_profile_id   uuid references public.profiles(id) on delete set null,

  provider_label       text,
  reason               text,

  amount_usdc          numeric(12, 7) not null check (amount_usdc > 0),

  requested_fields     passport_field[] not null default '{}',
  approved_fields      passport_field[] not null default '{}',

  status               encounter_status not null default 'requested',

  -- Two independent clocks. An unanswered request goes stale on its own; the
  -- consent expires separately once granted.
  request_expires_at   timestamptz not null default now() + interval '30 minutes',
  consent_expires_at   timestamptz,
  consented_at         timestamptz,
  revoked_at           timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- A provider can never hold a field the patient did not approve, even if the
  -- application layer is wrong: approved must be a subset of requested.
  constraint encounters_approved_subset_of_requested
    check (approved_fields <@ requested_fields)
);

comment on table public.encounters is
  'A charge carrying a scoped, expiring request for passport fields. Holds no health content.';

create index if not exists encounters_provider_idx on public.encounters (provider_profile_id);
create index if not exists encounters_patient_idx  on public.encounters (patient_profile_id);

create table if not exists public.payments (
  id             uuid primary key default gen_random_uuid(),
  encounter_id   uuid not null unique references public.encounters(id) on delete cascade,

  -- Stellar transaction hashes are 64 hex characters. Nullable because Pollar can
  -- answer 'pending' before a hash settles.
  tx_hash        text unique check (tx_hash is null or tx_hash ~ '^[0-9a-f]{64}$'),
  status         text not null check (status in ('pending', 'success', 'error')),
  amount_usdc    numeric(12, 7) not null check (amount_usdc > 0),
  network        text not null check (network in ('testnet', 'mainnet')),
  failure_reason text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.payments is
  'Payment result bound to an encounter. Financial metadata only, never health detail, and nothing
   here is written into a transaction memo (ADR-003).';

drop trigger if exists encounters_touch_updated_at on public.encounters;
create trigger encounters_touch_updated_at
  before update on public.encounters
  for each row execute function public.touch_updated_at();

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
  before update on public.payments
  for each row execute function public.touch_updated_at();

alter table public.encounters enable row level security;
alter table public.payments   enable row level security;

revoke all on public.encounters from anon, authenticated;
revoke all on public.payments   from anon, authenticated;

-- Verification: four tables, RLS on each, no policies for anon or authenticated.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'medical_profiles', 'encounters', 'payments')
order by c.relname;
