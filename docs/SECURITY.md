# Security and privacy

## Scope and threat model

This is a public hackathon prototype, not a production healthcare platform. Likely threats include
secret leakage, unauthorized or over-broad provider access, stale consent, insecure direct object
references, injection, sensitive logging, accidental real data use, wallet/transaction mistakes,
and dependency compromise.

## Non-negotiable controls

- Use synthetic medical data only and show “not for clinical use” prominently.
- Never store plaintext medical records, diagnoses, allergies, medications, documents, or
  identity data on a public blockchain.
- Keep `.env*` out of Git except `.env.example`; rotate any credential ever exposed.
- Server-only keys remain outside Client Components and public logs.
- Validate every untrusted payload, authenticate the actor, and authorize the exact resource and
  fields requested.
- Default consent to minimal scope and short expiry; support explicit revocation and deny access
  after expiry.
- Use private storage, least-privilege database roles, and deny anonymous access by default.
- Sanitize logs and analytics; never record medical content, secrets, OTPs, or full access tokens.
- Do not initiate financial operations or Mainnet transactions without explicit owner approval.

## Future controls

Use platform/library authenticated encryption such as AES-GCM only if field-level encryption is
needed; never create custom cryptography. Document key management, nonce handling, rotation, and
recovery before implementation. Add RLS and API authorization tests with the database phase.

## Release gate

Before a public demo: run dependency audit and secret scan, inspect client bundles/configuration,
verify synthetic fixtures, test consent expiry/revocation, confirm TestNet/Mainnet configuration,
and rehearse the approved transaction with a minimal balance.
