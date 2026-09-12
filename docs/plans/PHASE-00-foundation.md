# Phase 0 — Foundation

## Goal

Create a professional, reproducible, public-repository-ready engineering system without product
features, credentials, cloud resources, funding, or transactions.

## P0 work

- Inspect Node/npm/Git/GitHub tooling and preserve existing work.
- Scaffold stable Next.js, strict TypeScript, Tailwind, lint, formatting, tests, and CI.
- Research official Pollar sources, pin compatible packages, and verify installed imports/types.
- Document product, bounty, architecture, security, data, AI workflow, decisions, and all phases.
- Initialize Git, establish `main`/`develop`, scan secrets, validate locally, and publish publicly
  if GitHub authentication is available.

## Acceptance gate

Lint, typecheck, unit tests, build, and preferably Playwright pass without credentials. Pollar
packages import but perform no live operation. Agent/manual-action protocol is canonical. Git and
both local branches exist. Public repository/remote CI is complete or its precise external blocker
is documented. No money, Mainnet, real medical data, or false implementation claims.
