# Master execution plan

Deadline: **2026-09-13 23:59 America/La_Paz**.

## Priority rules

- **P0:** cannot submit or demonstrate without it.
- **P1:** directly improves judging score.
- **P2:** useful polish.
- **P3:** post-hackathon.

When schedule slips, cut P3 then P2. Protect the single P0 path:

`patient → passport → QR → consent → provider view → encounter → Pollar payment → real transaction`

## Sequence and gates

1. **Phase 0 — Foundation:** reproducible repository, safe architecture, tests, CI, docs.
2. **Phase 1 — Pollar spike:** prove the highest-risk TestNet integration immediately.
3. **Phase 2 — Medical passport:** smallest credible synthetic patient profile.
4. **Phase 3 — Consent:** QR-driven, scoped and temporary provider access.
5. **Phase 4 — Encounter/payment:** associate confirmed Pollar payment with encounter.
6. **Phase 5 — Release:** responsive polish, public deploy, approved Mainnet proof, demo.

Do not begin a later phase until the current acceptance gate passes or the owner explicitly
authorizes an exception. Each phase updates `docs/STATUS.md` and records human-only actions.
