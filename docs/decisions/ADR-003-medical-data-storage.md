# ADR-003: Keep medical data private and off-chain

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

Public blockchains are inappropriate for plaintext medical information and immutable disclosure
conflicts with privacy, correction, expiry, and revocation needs.

## Decision

Store synthetic MVP medical content in private application storage (planned Supabase PostgreSQL,
and private Storage only if needed). Use server authorization and scoped, expiring consent. Store
only payment identifiers and minimal non-medical proof/provenance data on-chain where justified.

## Consequences

No diagnosis, allergy, prescription, document, identity field, or medical narrative may appear in
transaction metadata. Future encryption uses established authenticated primitives with documented
key management; Phase 0 implements no custom cryptography.
