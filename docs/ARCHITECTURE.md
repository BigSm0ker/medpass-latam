# Architecture

## System shape

```text
Next.js routes and UI
        ↓
feature services (passport, consent, encounters, payments, audit)
        ↓
server/API authorization boundary
        ↓                    ↓
Pollar adapter          Supabase adapter
        ↓                    ↓
official Pollar SDK     private PostgreSQL/storage
```

## Boundaries

- **Presentation:** App Router route groups and reusable accessible components. It displays state;
  it does not own payment or authorization rules.
- **Domain/features:** feature-owned types and workflows. Services orchestrate adapters and expose
  explicit states to UI.
- **Server/API:** validates untrusted input, authenticates identity, authorizes each resource,
  applies expiry/revocation, and sanitizes responses/logs.
- **Pollar:** `src/lib/pollar/` is the only raw SDK boundary. Phase 1 will choose supported auth and
  transaction APIs after testing installed types on TestNet.
- **Supabase:** `src/lib/supabase/` will separate browser-safe, server, and service-role clients.
  Service-role access is server-only; direct anonymous data access is denied unless RLS explicitly
  grants a safe operation.
- **Privacy utilities:** established encryption/integrity primitives only; no custom cryptography.

## Data placement

Medical content, identity data, consent details, and documents remain in private application
storage. Public chains may contain wallet addresses, transaction identifiers, amounts, and
minimal integrity/provenance metadata only when justified—never plaintext health data.

## MVP deployment

One Next.js application on Vercel and one Supabase project are sufficient. No Docker,
microservices, queues, custom smart contracts, or FHIR server are planned. External credentials
are injected by deployment environments and are never required for compilation.

## Quality attributes

- Complete core demo path over breadth.
- Server-enforced authorization and least privilege.
- Typed adapters and validated boundary payloads.
- Graceful loading/error/unavailable states.
- Deterministic, credential-free CI plus narrowly scoped TestNet verification.
