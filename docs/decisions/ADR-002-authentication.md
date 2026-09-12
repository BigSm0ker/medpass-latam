# ADR-002: Investigate Pollar as the identity entry point

- **Status:** Proposed; validate in Phase 1
- **Date:** 2026-09-11

## Context

The product needs patient/provider identity and server-enforced authorization. A second habitual
login system would increase UX and delivery risk.

## Decision

Start by testing Pollar's currently documented email/OAuth/wallet authentication and stable user
identity on TestNet. Do not add Supabase Auth in Phase 0. If the Pollar subject is sufficient, link
it server-side to a minimal profile/role record. If not, document the exact gap and choose the
smallest supplementary mechanism in a new ADR.

## Consequences

Phase 1 must prove session restoration, stable identifiers, logout, patient/provider mapping, and
server verification—not merely a client-side “logged in” flag. Database authorization remains
server-side with least privilege and RLS defense in depth.
