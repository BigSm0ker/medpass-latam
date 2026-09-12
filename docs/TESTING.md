# Testing strategy

## Commands

- `npm run lint` — ESLint including Next.js rules.
- `npm run typecheck` — strict TypeScript without emission.
- `npm test` — Vitest unit/component smoke coverage in jsdom.
- `npm run build` — production Next.js compilation.
- `npm run test:e2e` — Playwright Chromium smoke flow against a managed local server.
- `npm run format:check` — Prettier verification.
- `npm run ci` — required secret-free lint/typecheck/unit/build sequence.

Phase 0 tests prove the notice, SDK import boundary, page rendering, and build pipeline. They do not
call Pollar or Supabase and need no credentials.

Later phases should test domain rules heavily: requested-vs-approved fields, consent expiry and
revocation, resource ownership, payment state transitions, and synthetic encounter association.
External TestNet tests must be isolated, safe to retry, and never run against Mainnet by default.

Use synthetic fixtures only. Do not snapshot or log tokens, OTPs, wallet secrets, medical content,
or service credentials.

## Phase 2 authorization evidence — verified live 2026-09-12

Run against the local dev server with a real Pollar wallet and the Supabase project, not mocks.

| Attempt                                                           | Result                        |
| ----------------------------------------------------------------- | ----------------------------- |
| Owner reads own passport with a valid session                     | 200, correct record           |
| Same request with no session cookie                               | 401                           |
| PUT carrying `address`/`stellar_address` for another wallet       | Ignored; wrote to own record  |
| Forged cookie naming the victim's real address, future expiry     | **401**                       |
| Cookie with the address but no signature segment                  | 401                           |
| `/api/auth/verify` with a signature over a challenge never issued | 400                           |
| `document.cookie` from page scripts                               | `(none)` — cookie is httpOnly |

Two notes on method, because they change what the results mean.

The body-injection attempt returns 200 by design. There is no patient identifier in the passport
API, so the extra fields are simply not read; the write lands on the caller's own record. A 200
here is the correct outcome, not a bypass.

An earlier forged-cookie attempt was inconclusive and is recorded so it is not repeated: setting
`document.cookie` while a valid httpOnly cookie of the same name exists does nothing, so that
request still carried the genuine session. The decisive test signs out first, then forges, and that
is the 401 above.
