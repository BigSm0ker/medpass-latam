# Project status

- **Current phase:** Phase 4 — Qualification (agent-side work complete; owner actions pending)
- **Current branch:** `develop` (Phases 2 and 3 merged via PR #5; `main` is the production branch)
- **Completed:** Phase 0 foundation. Phase 1: verified the real `0.11.3` API surface from installed
  declarations; typed client/server environment boundary with a browser-import guard; centralized
  Pollar adapter (`config`, `assets`, `payments`, `funding`, `provider`) pinned to TestNet;
  development-only spike route exercising login, wallet, balance, enabled assets, trustline,
  distribution-rule claims, USDC payment, and history; 36 unit tests; lint, typecheck, build and
  formatting pass; production bundle scanned and free of the server secret.
- **Active:** Phase 3. Implemented as one fused flow: a provider opens a charge naming an amount
  and the exact fields needed; the QR carries only a random opaque token; the patient sees the
  request before disclosing anything and approves a subset; the provider is served strictly the
  approved fields while consent is live; the patient pays USDC through the Phase 1 adapter and the
  receipt is bound to the encounter. Expiry, rejection and revocation all deny access.
  82 unit tests, lint, typecheck, build and formatting pass; no server secret reaches the bundle.

- **Blocked:** nothing on the agent side. Both Supabase migrations are applied and `npm run ci`
  passes on a clean checkout of `develop` with no environment variables. What remains is external:
  the Vercel deployment (owner's account) and **Mainnet access, still "Under review" with a stated
  two-business-day turnaround that lands after the Sunday deadline** — the single largest risk to
  the submission.

- **Repository:** <https://github.com/BigSm0ker/medpass-latam> is public; `develop` is the default
  collaboration branch and `main` is protected against direct changes, force-push, and deletion.
- **Human actions:** set a non-zero `Starting XLM balance` in the dashboard so demo wallets can pay
  fees; later Mainnet approval and funding, Vercel, and Supabase authorization.
  See `docs/MANUAL_ACTIONS.md`.
- **Known risks:** deadline is 2026-09-13 23:59 America/La_Paz; demo wallets start with zero
  spendable XLM and cannot pay network fees until the dashboard sets a non-zero starting balance;
  Mainnet access approval is still pending and reserves are the team's own cost.
- **Next recommended task:** deploy to Vercel **on TestNet without waiting for Mainnet approval** —
  the public-URL requirement is independent of the transaction requirement — then allow-list the
  Vercel origin in the TestNet Pollar application, record the demo, and chase Mainnet approval in
  the bounty Telegram group. Procedures are in `docs/DEPLOYMENT.md`, `docs/MAINNET_RUNBOOK.md` and
  `docs/SUBMISSION.md`.

## Phase 1 verification — PASSED 2026-09-12

Confirmed TestNet payment: 1 USDC, ledger 4633398, hash
`5ce00279e8883b8e59a361e592a1c9c7de2dac717b7b14bf1212a60bf8e0f3f6`. Login, server verification,
custodial wallet, sponsored trustline, asset catalog, payment and explorer proof all verified
against Horizon. See `docs/POLLAR_INTEGRATION.md` for the full evidence and the setup sequence.
