# ADR-001: Minimal full-stack web baseline

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

The team has approximately two days to ship a public, polished end-to-end demo. Reliability,
handoff, and deployment speed matter more than theoretical flexibility.

## Decision

Use one Next.js App Router application with React, strict TypeScript, Tailwind CSS, npm, Pollar,
and later Supabase PostgreSQL. Validate with ESLint, Vitest/Testing Library, Playwright, production
builds, and GitHub Actions; deploy to Vercel on a free tier when authorized.

## Consequences

A single deployable unit minimizes integration overhead. Feature and adapter boundaries preserve
clarity without microservices. Docker, Prisma, GraphQL, Redux, custom smart contracts, and a FHIR
server are excluded unless a later concrete blocker justifies a new ADR.

ESLint is intentionally pinned at 9.39.5 for this baseline. A direct compatibility check of
ESLint 10.10.0 against Next.js 16.3.5 failed inside the bundled `eslint-plugin-react`
`react/display-name` rule, so the newest compatible line takes precedence over the newest major.
Re-evaluate only with a Next.js/plugin update and a passing validation run.
