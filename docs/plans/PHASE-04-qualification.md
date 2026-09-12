# Phase 4 — Qualification (revised 2026-09-12)

## Why this phase now exists

The bounty has six hard participation requirements. Three of them are not features and cannot be
earned by writing more code: a public URL, a real Mainnet transaction, and a demo. A team with a
beautiful product and no Mainnet hash does not place — it does not qualify at all.

The Mainnet access request was submitted 2026-09-11 and shows **"Under review — we typically
respond within 2 business days"**, which lands after the Sunday deadline. That is the single
largest risk to the submission and it is entirely external, so the work here is to make everything
else ready and reduce the Mainnet step to minutes once approval arrives.

## P0 slice

- Public Vercel deployment with environment variables set, and the production origin added to the
  Pollar dashboard's allowed origins. **The origin will otherwise fail exactly as localhost did**,
  presenting as "Could not load sign-in options".
- A judge can try the public URL and understand the product without owning a funded wallet.
- Mainnet runbook rehearsed on TestNet so the real switch is mechanical.
- Mainnet transaction executed only after access is granted and the owner approves at that moment.
- Transaction hash captured with explorer evidence.

## Gate

Fresh-browser smoke test on the public URL passes, the Mainnet hash resolves on a public explorer,
and the receipt in the UI refers to the same transaction.
