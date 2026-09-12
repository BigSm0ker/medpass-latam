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

1. **Phase 0 — Foundation:** reproducible repository, safe architecture, tests, CI, docs. DONE.
2. **Phase 1 — Pollar spike:** prove the highest-risk TestNet integration immediately. DONE.
3. **Phase 2 — Medical passport:** smallest credible synthetic patient profile. DONE.
4. **Phase 3 — Charge with consent:** one QR-driven flow where the provider requests fields and an
   amount, the patient approves scope and pays through Pollar. _Revised 2026-09-12: this absorbs
   the former Phase 4 payment work._
5. **Phase 4 — Qualification:** public URL, Mainnet runbook, Mainnet transaction, demo. _Revised:
   these are the bounty's hard requirements, and none of them is a feature._
6. **Phase 5 — Submission:** README, 300-word description, demo video, Telegram delivery.

## Revision note — 2026-09-12

The original sequence treated deployment and the Mainnet proof as a final polish phase. The
official bounty PDF makes them participation requirements: without a public URL, a Mainnet hash and
a demo, a submission does not qualify regardless of quality. The Mainnet access request is still
"under review" with a stated 2-business-day turnaround that lands after the deadline.

So the order of defence changed. Protect qualification first, then depth. If time runs short, cut
scope inside Phase 3 — never cut Phase 4.

Do not begin a later phase until the current acceptance gate passes or the owner explicitly
authorizes an exception. Each phase updates `docs/STATUS.md` and records human-only actions.
