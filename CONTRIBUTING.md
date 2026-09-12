# Contributing to MedPass LATAM

Read `AGENTS.md`, `docs/STATUS.md`, and the active phase plan before starting. Branch from
`develop` using `feature/<short-name>` or `fix/<short-name>`, keep scope small, and use
Conventional Commits.

Before opening a pull request, run:

```bash
npm ci
npm run ci
npm run format:check
npm run test:e2e
```

Update relevant documentation and `docs/STATUS.md`. Significant or hard-to-reverse decisions
require an ADR. Never commit credentials, real medical data, or generated local artifacts.

Pull requests target `develop`. A stable `develop` is promoted by pull request to `main` for
release.
