<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MedPass LATAM — canonical agent instructions

These rules are non-negotiable for every coding agent.

## Start every task

1. Read `docs/STATUS.md` first.
2. Read the active phase plan under `docs/plans/` before modifying code.
3. Inspect the worktree and preserve unrelated human or agent changes.
4. Confirm the task belongs to the active phase. Do not begin a later phase unless explicitly
   authorized and current acceptance criteria pass.

## Git and handoff

- Never work directly on `main`. Prefer `feature/*` or `fix/*` branches from `develop`.
- Use Conventional Commits and coherent changes.
- Run required validation before claiming completion.
- Update `docs/STATUS.md` before handoff and record significant decisions in an ADR.
- Keep repository documentation canonical; do not rely on chat history.

## Safety and scope

- This is a hackathon MVP, not a production healthcare system. Optimize the complete demo path
  and do not silently change technology choices.
- Use synthetic/fictitious medical data only. Never put plaintext medical information on a
  public blockchain.
- Never commit secrets or expose server credentials to the browser.
- Never spend money or initiate any Mainnet transaction without explicit human approval at that
  moment.
- Do not add dependencies without a concrete, documented need.
- If an external account, secret, payment, KYC, login approval, OAuth grant, or human decision
  blocks work, add a `[HUMAN_REQUIRED]` entry to `docs/MANUAL_ACTIONS.md`; do not improvise.

## External SDKs and architecture

- Never invent external SDK APIs. For Pollar, verify current official docs, repositories,
  examples, and installed TypeScript declarations; installed types win on disagreement.
- Centralize Pollar calls in `src/lib/pollar/` and Supabase access in `src/lib/supabase/`.
- Never expose Pollar secret keys or Supabase service-role credentials to Client Components.
- Update architecture/security docs when boundaries change and create an ADR for significant
  decisions.
- Prefer the smallest typed, tested solution that protects the P0 demo path.
