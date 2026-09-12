# AI development workflow

## Start

Read, in order: `AGENTS.md`, `docs/STATUS.md`, the active phase plan, relevant architecture/ADR
files, and any nested `AGENTS.md` in the area being changed. Inspect Git status and installed types
before assuming repository or SDK behavior.

## Work

Branch from `develop` with `feature/<scope>` or `fix/<scope>`. Keep changes inside the current
phase and the smallest end-to-end outcome. Do not add dependencies, infrastructure, or abstractions
without a concrete need. Use Conventional Commits.

## Definition of done

- Acceptance criteria for the task/phase pass.
- Changed behavior has proportionate tests using synthetic data.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass; run Playwright when UI
  behavior changes.
- Security/privacy boundaries and client/server credential separation are preserved.
- Architecture or workflow changes update docs and significant decisions add an ADR.
- `docs/STATUS.md` reflects completion, blockers, risks, and next task.

## Decisions and blockers

Use an ADR for decisions with architectural, security, data, identity, or external-integration
consequences. For payment, KYC, secrets, account approval, OAuth, destructive cloud work, or other
human-only action, add the canonical `[HUMAN_REQUIRED]` block to `docs/MANUAL_ACTIONS.md` rather
than improvising.

## Handoff

Leave a clean or clearly explained worktree. Summarize branch, commits, changed boundaries,
validation results, unresolved manual actions, and exact next recommended task. Another agent must
be able to continue from repository files without earlier chat context.
