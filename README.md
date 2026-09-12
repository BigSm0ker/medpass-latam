# MedPass LATAM

**Pay the clinic in seconds. Share only what the doctor needs.**

> Prototype built for the Pollar Bounty at Buildathon Cochabamba 2026. The payment is real — USDC
> moves on Stellar through Pollar and every receipt links to a public explorer. **All medical
> records are fictitious.** This is not a clinical system and it makes no medical claims.

## The problem

Across Latin America a great many consultations are still settled in cash. The neighbourhood clinic
has no card terminal, the visiting patient has no local bank account, or the person actually paying
is a relative in another country. Meanwhile the provider treats someone whose allergies, current
medications and conditions they cannot see.

Both halves of that are the same moment, and MedPass treats them as one: **a charge that carries
consent**.

A provider creates a charge naming an amount and the specific health details this visit needs. The
patient scans one QR code, sees exactly what is being asked before anything is disclosed, approves
a subset, and pays in USDC. The provider gets the context they need; the patient keeps everything
they did not agree to share.

`provider charge → QR → patient reviews → patient approves a scope → provider sees only that → patient pays USDC → verifiable receipt`

## How we integrated Pollar

Pollar is used for two distinct things, and the second one is the part we would point at first.

### 1. Payments — the obvious use

`sendPayment()` moves USDC from the patient's wallet to the provider's, on Stellar. The payment
adapter lives in `src/lib/pollar/` and nothing outside that directory touches the SDK directly.

Two details we were deliberate about:

- **The USDC issuer is never hard-coded.** `refreshAssets()` returns the assets the application is
  provisioned for on the active network, and we resolve the issuer from that catalog at runtime.
  The TestNet and Mainnet issuers differ, so this makes switching networks a configuration change
  rather than a code change.
- **`pending` is kept distinct from `success`.** Pollar returns `pending` when the network has
  accepted a transaction the ledger has not yet confirmed. A receipt that treated the two alike
  would tell a patient their consultation was paid before it was.

### 2. Identity — the use we think is more interesting

The product needed server-enforced authorization: a request for a passport has to prove who is
asking. The SDK exposes no server-side verification surface — no token introspection, no JWKS, no
userinfo endpoint — and its access tokens are DPoP-bound to a key held in the browser, so a server
cannot replay one to ask Pollar who the caller is.

What it does expose is `client.stellar.sep53.signMessage()`. So we built authentication on it:

1. The server issues a short-lived, HMAC-signed challenge.
2. The browser signs it with the Pollar wallet (SEP-53: ed25519 over
   `SHA-256("Stellar Signed Message:\n" + message)`).
3. The server verifies that signature against the claimed Stellar address and issues an httpOnly
   session cookie.

The wallet is the user's identity, not just their payment method. Pollar handles onboarding for
people who have never used a wallet — email or Google sign-in, custodial wallet, sponsored
trustlines — and we get a cryptographically verifiable subject out of it. See
[ADR-005](docs/decisions/ADR-005-server-session.md).

### What we found in the SDK, honestly

Offered in case it is useful to the Pollar team:

- **A stray space in an asset code fails silently and confusingly.** A leading space made our USDC
  register as `" USDC"` typed `credit_alphanum12`, which is a genuinely different asset from `USDC`
  as `credit_alphanum4`. The dashboard flagged it `Invalid` but the blocking error surfaced
  elsewhere as "wallets unfunded", so we chased the wrong thing first. Our adapter deliberately does
  **not** trim this field — tolerating the space would build payments against an asset that merely
  looks like USDC.
- **The sponsored reserve does not cover transaction fees.** With Funding Mode's
  `Starting XLM balance` at its `0` default, a freshly onboarded wallet exists on-chain, holds a
  sponsored trustline, and still cannot pay — `sendPayment` fails with "Not enough XLM to cover the
  network fee". The two costs are easy to conflate.
- **`ORIGIN_NOT_ALLOWED` reaches the end user as "Check your connection and try again."** A 403
  from `/applications/config` is a configuration problem, and presenting it as a network problem
  sends developers looking at their wifi. The dashboard already knows the allowed origins; naming
  the origin in that message would have saved us an hour.

## Try it

- **`/`** — what the product is.
- **`/charge`** — the provider side: create a charge, show the QR, watch the authorized information
  appear once the patient approves.
- **`/passport`** — the patient side: sign in and fill in a synthetic passport.
- **`/c/<token>`** — what scanning the QR opens.

To see the whole flow, open `/charge` on one device and scan its QR with another. Signing in with
two different accounts gives you the two roles.

## Security posture

- Medical content stays in private storage. The chain carries the payment and nothing else
  ([ADR-003](docs/decisions/ADR-003-medical-data-storage.md)).
- The QR carries a random opaque token — no health data, no patient identifier.
- Disclosure is an allow-list projection, so a field added to the passport later cannot leak by
  omission.
- Caller identity comes only from a signed httpOnly cookie; an address in a request body is never
  trusted. The passport API exposes no patient identifier at all, so an insecure direct object
  reference is not expressible.
- A database CHECK enforces that approved fields are a subset of requested ones, and another
  refuses any record not marked synthetic.
- Row Level Security is deny-by-default with zero policies for anonymous and authenticated roles.

Attack attempts we ran against our own API — forged cookies naming the victim's real address,
unsigned cookies, body-injected addresses, signatures over challenges the server never issued — are
recorded with their results in [docs/TESTING.md](docs/TESTING.md).

## Stack

Next.js App Router, React 19, strict TypeScript, Tailwind CSS 4. Pollar `@pollar/core` and
`@pollar/react` 0.11.3. Supabase PostgreSQL. Zod, `@stellar/stellar-base`, qrcode.react. Vitest and
Playwright.

## Running it locally

```bash
npm ci
cp .env.example .env.local   # then fill in the values
npm run dev
```

You will need a Pollar application with your dev origin in its allowed domains, a funded
application wallet, USDC enabled as an asset, and a Supabase project with the migrations in
`supabase/migrations/` applied. `docs/POLLAR_INTEGRATION.md` documents the setup order — each step
blocks the next and skipping one produces a misleading error.

## Documentation

Engineering decisions, phase plans and evidence live in [`docs/`](docs/). Start with
[STATUS.md](docs/STATUS.md).
