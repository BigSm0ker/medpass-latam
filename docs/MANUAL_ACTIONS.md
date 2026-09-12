# Manual actions

Keep unresolved actions as `PENDING`. Never paste secret keys into chat or commit them.

[COMPLETED]

Task: Authenticate GitHub CLI and publish the repository
Why: Phase 0 required a public repository and remote branch workflow.
Exact action required: Completed. GitHub CLI is authenticated as `BigSm0ker`; public repository
<https://github.com/BigSm0ker/medpass-latam> contains `main` and `develop`; `develop` is the default
branch and `main` has lightweight protection.
Cost: $0
Risk: Selecting the wrong GitHub account or accidentally exposing an authentication token
Status: COMPLETED

[COMPLETED]

Task: Configure Pollar TestNet credentials for Phase 1
Why: The technical spike requires the owner's dashboard application and current enabled auth/wallet
settings.
Exact action required: Completed. `.env.local` contains `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` and
`POLLAR_SECRET_KEY` (presence verified by variable name only; no value was read, logged, or
committed). `.env.local` remains ignored by Git.
Cost: $0
Risk: Secret exposure if placed in a browser variable, chat, or Git
Status: COMPLETED

[COMPLETED]

Task: Allow the local development origin in the Pollar dashboard
Why: The SDK's first call, `GET /v2/applications/config`, is rejected with
`403 {"code":"ORIGIN_NOT_ALLOWED"}`. The login modal therefore renders "Could not load sign-in
options" and no authentication is possible. The publishable key, the network pin, and the client
construction are all confirmed correct — the application simply does not list the dev origin.
Exact action required: In the Pollar Dashboard, open this application's settings and add the
allowed origins `http://localhost:3000` and `http://127.0.0.1:3000`. Add the public Vercel origin
too when Phase 5 deploys. Then reload `/spike/pollar`; no code change or dev-server restart is
needed.
Cost: $0
Risk: None. Do not widen the allowlist to a wildcard.
Status: COMPLETED — verified 2026-09-12: `GET /applications/config` now returns 200 and the login
modal renders the application name plus email, Google and Wallet sign-in options.

[HUMAN_REQUIRED]

Task: Fund the app wallet and enable USDC trustlines in the Pollar dashboard [RESOLVED]
Why: The dashboard setup checklist shows the two remaining required steps, and they map exactly to
the two blockers observed live on 2026-09-12:

GET /wallet/assets -> assets: [ { code: XLM, enabledInApp: false } ] (no USDC)
GET /distribution/rules -> rules: []
GET /wallet/balance -> exists: false, balances: []

The mechanism is app-wallet funding, not deferred funding waiting on an asset. Each user wallet
costs roughly 2 XLM of Stellar base reserve, paid by the application's own wallet. That wallet is
unfunded, so neither user wallet could be created — which is why `existsOnStellar` is false for
both. Trustlines are the separate gate: without them a user wallet cannot hold USDC at all.

Exact action required: In the Pollar Dashboard for `medpass-web-testnet`, in this order:

1. "Fund app wallet" — open it, copy the application wallet address, and fund it with TestNet
   XLM (free via Friendbot: https://friendbot.stellar.org/?addr=<APP_WALLET_ADDRESS>).
   Roughly 10 XLM covers about five user wallets.
2. "Enable trustlines" — enable USDC so user wallets can hold it.
   Order matters: a trustline can only be set on an account that already exists, and accounts only
   exist once the app wallet pays their reserve.
   Then reload `/spike/pollar`, press "Refresh assets" and "Refresh balance"; a USDC issuer should
   resolve and `Exists on Stellar` should turn true.
   Cost: $0 on TestNet (Friendbot XLM is free)
   Risk: None on TestNet. Do not fund a Mainnet wallet while doing this.
   Status: PENDING

[HUMAN_REQUIRED]

Task: Apply the Phase 2 Supabase migration
Why: The passport cannot persist until the schema exists, and this session has no network route to
the Supabase project — requests from the agent's shells time out, so the migration cannot be
applied or verified from here.
Exact action required: Open the Supabase project's SQL editor and run
`supabase/migrations/0001_medical_passport.sql` in full. It creates `profiles` and
`medical_profiles`, a `stellar_address` domain, a `blood_type` enum, updated_at triggers, a
synthetic-only CHECK constraint, and enables deny-by-default RLS. Then add `SESSION_SECRET` to any
deployment environment (it is already generated in local `.env.local`).
Cost: $0 on the free tier
Risk: None. The migration creates objects only and drops nothing.
Status: COMPLETED 2026-09-12. Both tables exist with RLS enabled and zero policies, so anon and
authenticated roles can read and write nothing. The migration was made idempotent after the first
run failed on a re-run: Postgres has no CREATE DOMAIN/TYPE IF NOT EXISTS, so those are now guarded
in DO blocks and the file ends with a verification query.

[HUMAN_REQUIRED]

Task: Deploy to Vercel and add the production origin to Pollar
Why: A public URL judges can try is bounty requirement 5 — a participation requirement, not polish.
Importing a repository requires the owner's Vercel account authorization, which an agent must not
perform.
Exact action required: Follow `docs/DEPLOYMENT.md`. Import the repository, set the six environment
variables (generating a NEW `SESSION_SECRET` for production — a leaked one lets anyone forge a
session for any wallet), and then add the Vercel domain to the Pollar dashboard's allowed origins.
That last step is the one that will otherwise cost an hour: the failure presents as "Could not load
sign-in options. Check your connection", which is a 403 ORIGIN_NOT_ALLOWED, not a network fault.
Cost: $0 on the free tier
Risk: Review any pricing prompt and stop if a paid plan is required.
Status: PENDING

[COMPLETED]

Task: Apply the Phase 3 Supabase migration
Why: The charge-with-consent flow needs the `encounters` and `payments` tables, and this session has
no network route to the Supabase project.
Exact action required: Run `supabase/migrations/0002_encounters.sql` in the SQL editor. It is
idempotent and ends with a verification query that should report four tables, RLS enabled on each,
and zero policies.
Cost: $0
Risk: None. It creates objects only.
Status: COMPLETED 2026-09-12 — verified: the query returns all four tables with RLS enabled and
zero policies, so `encounters` and `payments` exist and remain closed to anon/authenticated.

[HUMAN_REQUIRED]

Task: Set a non-zero starting XLM balance for demo wallets
Why: The sponsored base reserve does NOT cover transaction fees. With Funding Mode's
`Starting XLM balance` at 0, a freshly onboarded wallet holds zero spendable XLM and the first
payment fails with "Not enough XLM to cover the network fee". This was hit during the Phase 1
spike and worked around with Friendbot, which is not available on Mainnet and will not exist for
a judge onboarding fresh during the demo.
Exact action required: In the Pollar Dashboard under Funding Mode, set `Starting XLM balance` to a
small non-zero value (1 XLM is ample; fees are 0.00001 XLM) and save. Verify by onboarding a new
test user and sending a payment without any manual funding.
Cost: 1 XLM per demo wallet on TestNet (free); real XLM on Mainnet
Risk: None beyond the per-wallet XLM cost
Status: PENDING

[HUMAN_REQUIRED]

Task: Push the `feature/pollar-spike` branch to GitHub
Why: This session reaches the repository through a Linux bridge that carries no GitHub
credentials, so `git push` fails with no authentication available. The commits exist locally.
Exact action required: From Windows, run `git push -u origin develop` and
`git push -u origin feature/pollar-spike`, then open a pull request into `develop`.
Cost: $0
Risk: None beyond normal review
Status: PENDING

[HUMAN_REQUIRED]

Task: Fund the Mainnet app wallet and approve the final transaction before Phase 5
Why: The bounty requires a real Mainnet transaction, while approval and any Stellar reserve/funding
responsibility are unresolved.
Exact action required: A Pollar admin confirmed on 2026-09-12 that reserves are NOT sponsored:
"in this case the teams should fund the app wallet themselves", adding that they can send XLM if
the team has trouble. Mainnet access was requested and is awaiting approval. Therefore, before the
release proof: fund the Mainnet application wallet with real XLM, confirm Mainnet access was
granted, and approve the transaction only at execution time after reviewing destination and cost.
Cost: Real XLM for the app wallet plus ~2 XLM of base reserve per participating user wallet
(budget roughly 10-15 XLM), plus the approximately 1 USDC transaction itself. The bounty's
"1 USDC transaction" is therefore NOT the full cost.
Risk: Irreversible financial transfer; the reserve requirement is a real additional cost that was
previously unquantified
Status: PENDING — Mainnet access requested; reserve responsibility now confirmed as the team's

[HUMAN_REQUIRED]

Task: Authorize Vercel and Supabase accounts when their phases begin
Why: Public deployment and private persistence require account/OAuth actions that an agent must not
approve on the owner's behalf.
Exact action required: In Phase 2/5, authorize the selected free-tier Supabase and Vercel projects,
then place credentials only in local/Vercel environment settings. Review any pricing prompt and stop
if a paid plan is required.
Cost: $0 expected on free tiers
Risk: OAuth/account authorization and accidental paid-plan selection
Status: PENDING
