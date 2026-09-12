# ADR-002: Use Pollar as the identity entry point, with a server-side profile link

- **Status:** Accepted (Phase 1 resolved the Phase 0 proposal)
- **Date:** 2026-09-11; resolved 2026-09-12

## Context

The product needs patient/provider identity and server-enforced authorization. A second habitual
login system would increase UX and delivery risk. Phase 0 proposed testing Pollar first and
required Phase 1 to prove stable identity rather than a client-side "logged in" flag.

## Decision

Pollar remains the only end-user login. Phase 1 inspection of the installed `0.11.3` declarations
resolved the open question as follows.

`usePollar()` exposes both `isAuthenticated` and `verified`. `isAuthenticated` turns true for a
session restored optimistically from local storage; `verified` turns true only after the server
confirms it via login, refresh, or `/auth/session/resume`. Product authorization therefore cannot
be inferred from `isAuthenticated`, and no sensitive action may be gated on it.

`getUserProfile()` returns an in-memory profile that is deliberately never persisted, so it is not
a durable subject identifier. `wallet.address` is stable and durable, and `WalletInfo.custody` is
fixed at account creation.

We therefore link Pollar identity to application identity **server-side**: a minimal profile row
keyed by the Pollar-authenticated subject carries the MedPass role (patient or provider) and owns
every authorization decision. The client's session state selects what to render; it never decides
what a caller may read.

## Consequences

Phase 2 must create that profile/role table and verify the session server-side on every request
that touches medical data; a client-supplied identity or role is never trusted. Database
authorization stays least-privilege with RLS as defense in depth.

Supabase Auth is still not introduced — Pollar covers login, and adding a second identity system
would duplicate session handling for no demo benefit.

KYC helpers exist in the SDK (`getKycStatus`, `startKyc`, `resolveKyc`) and are deliberately
unused: no agent may perform KYC on the owner's behalf.
