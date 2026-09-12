-- MedPass LATAM — Phase 2: patient-owned medical passport
--
-- Identity note: the owner key is the patient's Stellar address, proven to the
-- server by a SEP-53 signature (see ADR-002 and src/server/auth). Supabase Auth
-- is deliberately not used, so `auth.uid()` is always null here and RLS cannot
-- express ownership on its own.
--
-- Consequence, stated plainly: RLS below is a deny-by-default backstop, not the
-- authorization mechanism. Every ownership decision is made in the server layer,
-- which alone holds the service-role key. The policies exist so that a leaked
-- anon/publishable key yields nothing.

create extension if not exists "pgcrypto";

-- A Stellar ed25519 public key in strkey form: 56 chars, base32, leading G.
create domain stellar_address as text
  check (value ~ '^G[A-Z2-7]{55}$');

create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  stellar_address stellar_address not null unique,
  role            text not null default 'patient' check (role in ('patient', 'provider')),
  display_name    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is
  'Application identity linked to a Pollar-custodied Stellar address. Contains no health data.';

-- Blood types are a closed set; anything else is a data-entry bug, not a variant.
create type blood_type as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown');

create table if not exists public.medical_profiles (
  id                      uuid primary key default gen_random_uuid(),
  profile_id              uuid not null unique references public.profiles(id) on delete cascade,
  blood_type              blood_type not null default 'unknown',
  -- Free-text clinical context, kept as arrays so the consent layer in Phase 3
  -- can disclose individual entries rather than a blob.
  allergies               text[] not null default '{}',
  medications             text[] not null default '{}',
  conditions              text[] not null default '{}',
  emergency_contact_name  text,
  emergency_contact_phone text,
  notes                   text,
  is_synthetic            boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- This prototype must never hold real patient data. Enforce it in the schema
  -- so no application bug can quietly persist a non-synthetic record.
  constraint medical_profiles_synthetic_only check (is_synthetic)
);

comment on table public.medical_profiles is
  'Synthetic patient passport. Never place this content on a public blockchain (ADR-003).';

create index if not exists medical_profiles_profile_id_idx
  on public.medical_profiles (profile_id);

-- Keep updated_at honest without trusting the application to set it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists medical_profiles_touch_updated_at on public.medical_profiles;
create trigger medical_profiles_touch_updated_at
  before update on public.medical_profiles
  for each row execute function public.touch_updated_at();

-- Deny by default. No policy is created for anon or authenticated, so those
-- roles can read and write nothing. The service-role key bypasses RLS and is
-- held only by the server layer.
alter table public.profiles          enable row level security;
alter table public.medical_profiles  enable row level security;

revoke all on public.profiles         from anon, authenticated;
revoke all on public.medical_profiles from anon, authenticated;
