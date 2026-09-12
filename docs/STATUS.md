# Project status

- **Current phase:** Phase 1 — Pollar Technical Spike (COMPLETE; acceptance gate passed)
- **Current branch:** `feature/pollar-spike` (from `develop`; `main` is the production branch)
- **Completed:** Phase 0 foundation. Phase 1: verified the real `0.11.3` API surface from installed
  declarations; typed client/server environment boundary with a browser-import guard; centralized
  Pollar adapter (`config`, `assets`, `payments`, `funding`, `provider`) pinned to TestNet;
  development-only spike route exercising login, wallet, balance, enabled assets, trustline,
  distribution-rule claims, USDC payment, and history; 36 unit tests; lint, typecheck, build and
  formatting pass; production bundle scanned and free of the server secret.
- **Active:** none; waiting for authorization to begin Phase 2.
- **Blocked:** none for Phase 1. Mainnet remains gated on access approval and explicit human
  approval at execution time.

- **Repository:** <https://github.com/BigSm0ker/medpass-latam> is public; `develop` is the default
  collaboration branch and `main` is protected against direct changes, force-push, and deletion.
- **Human actions:** set a non-zero `Starting XLM balance` in the dashboard so demo wallets can pay
  fees; later Mainnet approval and funding, Vercel, and Supabase authorization.
  See `docs/MANUAL_ACTIONS.md`.
- **Known risks:** deadline is 2026-09-13 23:59 America/La_Paz; demo wallets start with zero
  spendable XLM and cannot pay network fees until the dashboard sets a non-zero starting balance;
  Mainnet access approval is still pending and reserves are the team's own cost.
- **Next recommended task:** authorize **Phase 2 — Medical Passport**.

## Phase 1 verification — PASSED 2026-09-12

Confirmed TestNet payment: 1 USDC, ledger 4633398, hash
`5ce00279e8883b8e59a361e592a1c9c7de2dac717b7b14bf1212a60bf8e0f3f6`. Login, server verification,
custodial wallet, sponsored trustline, asset catalog, payment and explorer proof all verified
against Horizon. See `docs/POLLAR_INTEGRATION.md` for the full evidence and the setup sequence.
