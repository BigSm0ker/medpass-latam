# Phase 3 — Consent and provider access

## Goal

Deliver QR-driven, patient-approved, temporary, field-scoped provider access.

## P0 slice

- Patient QR contains an opaque, non-medical request entry reference.
- Provider identifies/request fields and a short access duration.
- Patient explicitly approves or rejects exact scope.
- Provider receives only approved fields while consent is active.
- Expired or revoked consent is denied and auditable.

Investigate Pollar signing/proof only if currently supported and it materially strengthens the
flow. Do not force blockchain into health disclosure.

## Gate

The two-role flow works in separate sessions, field minimization is demonstrated, expiry/revocation
tests pass, and QR contents reveal no health data or long-lived bearer authority.
