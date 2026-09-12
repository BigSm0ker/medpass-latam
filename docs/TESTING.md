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
