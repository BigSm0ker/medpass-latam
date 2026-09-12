# MedPass LATAM

> Hackathon prototype — not intended for clinical use. All demonstration records must be
> synthetic and fictitious.

MedPass LATAM is a portable, patient-controlled medical passport concept for people moving
between clinics, cities, and countries in Latin America. The intended MVP lets a patient present
a QR code, approve a provider's time-limited request for selected medical context, complete an
encounter, and pay the provider in USDC through Pollar.

**Current status:** Phase 0 engineering foundation is complete locally. Patient, provider,
consent, data persistence, and payment features are not implemented yet.

## Problem and proposed solution

Health context is often fragmented across organizations and borders. In an urgent or travel
scenario, a patient may need to repeat critical facts while having little control over how much a
provider can see. MedPass LATAM proposes one narrow, demonstrable path:

`patient → passport → QR → provider request → explicit consent → scoped view → encounter → USDC payment → verifiable result`

Private medical content remains in private application storage. Pollar adds user onboarding,
wallet infrastructure, and a verifiable payment result directly connected to the encounter. The
project will not force medical data onto a public blockchain.

## Architecture

The Next.js application is divided into presentation routes/components, feature-owned domain
logic, server/API authorization, centralized Pollar and Supabase adapters, and privacy utilities.
Raw SDK calls should not spread through UI components. See [Architecture](docs/ARCHITECTURE.md)
and the [decision records](docs/decisions/).

## Technology stack

- Node.js 20+ and npm 10+
- Next.js App Router, React, strict TypeScript, Tailwind CSS
- Pollar `@pollar/core` and `@pollar/react` (pinned, integration begins in Phase 1)
- Supabase PostgreSQL direction (client installed, no project or schema configured)
- Zod, React Hook Form, QRCode React, Lucide React
- Vitest, Testing Library, and Playwright
- GitHub Actions CI; Vercel planned for release

## Local setup

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Phase 0 does not require credentials.

Copy `.env.example` to `.env.local` only when a later phase needs external services. Never commit
`.env.local`. `NEXT_PUBLIC_*` values may be bundled for browsers; `POLLAR_SECRET_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are server-only. Variable names will be reconfirmed against the
service dashboards before use.

## Branch workflow

`feature/*` and `fix/*` branches target `develop`. Stable integration work is promoted by pull
request from `develop` to production branch `main`. Do not work directly on `main`.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run format:check
```

The default CI pipeline needs no Pollar or Supabase secrets. See [Testing](docs/TESTING.md).

## Security and privacy

- Synthetic medical data only; no real patient information.
- No plaintext medical data on public blockchains.
- Secrets remain server-side and out of Git.
- Every request must be authenticated, authorized, validated, and minimally logged.
- TestNet first. No Mainnet transaction or spending without explicit human approval.

See [Security](docs/SECURITY.md) and [manual actions](docs/MANUAL_ACTIONS.md).

## Bounty requirements

The release target is a public repository, public test URL, real Pollar integration in the
encounter payment flow, one approximately 1 USDC Mainnet transaction after explicit approval,
and a demo no longer than three minutes. Evidence and rubric mapping live in
[Bounty](docs/BOUNTY.md).

## Roadmap

1. Foundation — reproducible repository, docs, tests, CI, dependency and architecture baseline.
2. Pollar spike — prove onboarding, wallet, balances, transaction, and history on TestNet.
3. Medical passport — synthetic critical medical context.
4. Consent — QR request and temporary scoped provider access.
5. Encounter and payment — tie a confirmed Pollar USDC payment to the encounter.
6. Release — polish, deploy, approved Mainnet proof, and concise demo.

Detailed phase plans are under `docs/plans/`. Phase 1 must not begin without authorization.
