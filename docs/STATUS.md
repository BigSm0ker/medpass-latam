# Project status

- **Current phase:** Phase 1 — Pollar Technical Spike (adapter complete; live TestNet run pending)
- **Current branch:** `feature/pollar-spike` (from `develop`; `main` is the production branch)
- **Completed:** Phase 0 foundation. Phase 1: verified the real `0.11.3` API surface from installed
  declarations; typed client/server environment boundary with a browser-import guard; centralized
  Pollar adapter (`config`, `assets`, `payments`, `funding`, `provider`) pinned to TestNet;
  development-only spike route exercising login, wallet, balance, enabled assets, trustline,
  distribution-rule claims, USDC payment, and history; 36 unit tests; lint, typecheck, build and
  formatting pass; production bundle scanned and free of the server secret.
- **Active:** Phase 1 acceptance requires a human to run the spike page in a browser against the
  owner's dashboard application and record the TestNet evidence.
- **Blocked:** the Pollar dashboard does not allow the local dev origin. `GET /applications/config`
  returns `403 ORIGIN_NOT_ALLOWED`, so the login modal cannot load sign-in options and Phase 1's
  live verification cannot proceed until `http://localhost:3000` is allowlisted. Also blocked:
  pushing `feature/pollar-spike` to GitHub — the Linux bridge this session works
  through has no GitHub credentials. See `docs/MANUAL_ACTIONS.md`.
- **Repository:** <https://github.com/BigSm0ker/medpass-latam> is public; `develop` is the default
  collaboration branch and `main` is protected against direct changes, force-push, and deletion.
- **Human actions:** run the TestNet spike and record evidence; push the feature branch; later
  Mainnet approval, reserve clarification, Vercel, and Supabase authorization.
  See `docs/MANUAL_ACTIONS.md`.
- **Known risks:** deadline is 2026-09-13 23:59 America/La_Paz; distribution rules and enabled
  assets depend on dashboard configuration this repository does not control; Mainnet approval and
  reserve sponsorship remain external and unconfirmed.
- **Next recommended task:** run the spike at `/spike/pollar` in development, record the TestNet
  transaction hash and observed behavior in `docs/POLLAR_INTEGRATION.md`, then authorize
  **Phase 2 — Medical Passport**.

## Phase 1 verification checklist

Run `npm run dev` with `.env.local` configured, then open `/spike/pollar`:

- [ ] Login completes and `Server verified` reads `true`
- [ ] Wallet address, custody, and network (`testnet`) are shown
- [ ] Enabled assets resolve a USDC issuer; trustline is established or establishable
- [ ] A distribution rule is listed and a claim increases the spendable USDC balance
- [ ] A USDC payment to a second synthetic address returns `success` or `pending` with a hash
- [ ] The Stellar Expert link resolves the transaction on TestNet
- [ ] Transaction history includes the payment
