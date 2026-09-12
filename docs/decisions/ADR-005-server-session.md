# ADR-005: Prove identity to the server with a SEP-53 wallet signature

- **Status:** Accepted
- **Date:** 2026-09-12

## Context

ADR-002 established that Pollar is the only end-user login and that authorization must be enforced
server-side, because `usePollar().isAuthenticated` turns true for a session restored optimistically
from browser storage and therefore proves nothing to a server.

Phase 2 needed a concrete mechanism. Inspection of the installed `@pollar/core` 0.11.3 declarations
found no server-side verification surface: there is no token introspection endpoint, no JWKS, and
no userinfo route. Session access tokens are DPoP-bound to a key held in the browser, so a server
cannot replay one to ask Pollar who the caller is.

What the SDK does expose is `client.stellar.sep53.signMessage(message)`, which returns an ed25519
signature over `SHA-256("Stellar Signed Message:\n" + message)` together with the signer's address.
Pollar dispatches this by custody type — external wallets sign through their adapter, custodial
wallets sign server-side through the Pollar API — so one verification path covers every wallet.

## Decision

The server issues a short-lived, HMAC-signed challenge. The client signs it with SEP-53. The server
verifies the ed25519 signature against the claimed Stellar address using `@stellar/stellar-base`,
and only then issues an HMAC-signed, httpOnly session cookie carrying that address.

The signed address is the sole source of caller identity for every protected route. An address in a
request body, query string, or header is never trusted. The passport API deliberately exposes no
patient identifier at all, so an insecure direct object reference is not expressible.

The challenge is stateless: the server signs `nonce.expiry` rather than storing issued nonces. The
verified message is rebuilt from that token, never accepted from the client — otherwise a caller
could present a genuine signature over text of their own choosing.

`@stellar/stellar-base` is added for strkey decoding and ed25519 verification. Hand-rolling either
would be custom cryptography, which `docs/SECURITY.md` forbids.

## Consequences

Authorization no longer depends on trusting the browser. The cost is one extra signature prompt at
sign-in, and a `SESSION_SECRET` that must exist in every environment — it is validated at startup
and a short value is rejected, because a weak secret makes forged cookies indistinguishable from
real ones.

Because Supabase Auth is not used, `auth.uid()` is null in the database and RLS cannot express
ownership. Ownership is therefore enforced in the server layer, which alone holds the service-role
key, and RLS is configured deny-by-default as a backstop so a leaked publishable key yields nothing.
This trade is recorded openly in the migration itself.

Phase 3 can reuse the same mechanism for providers by adding a role to the profile row; the identity
proof does not change.
