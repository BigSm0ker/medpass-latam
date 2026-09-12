# Phase 5 — Submission (revised 2026-09-12)

## Goal

Turn a working product into a submission the judges actually receive, before the Sunday deadline.

Phase 4 proves the product qualifies. This phase is about how it is presented — which, given that
Impact is 30% of the score and is judged largely from the pitch and the demo, is not a formality.

## P0 slice

- **README** with a dedicated "How we integrated Pollar" section: the wallet and payment flow, and
  the SEP-53 signature used as server-side identity. Most teams will integrate a payment button;
  the identity use is the differentiator and has to be legible.
- **300-word description**, leading with the payment problem — paying a clinic that takes no cards,
  or paying from another country — and presenting consent as what makes that payment trustworthy.
- **Demo, 3 minutes maximum, recorded rather than live.** A live demo depends on venue wifi and a
  settling transaction; a recording controls both and still satisfies the rules.
- **Judge-accessible public URL.** A judge who has to create a wallet, obtain USDC and establish a
  trustline before seeing anything will score Impact from a screen they never got past. The demo
  path must be reachable without a funded wallet.
- Telegram delivery with every required item: project and team, description, repository link,
  public URL, demo video, **Mainnet transaction hash**, and the Vaquita account for the prize.

## Honest limitations to state rather than hide

All medical data is synthetic; the prototype is not for clinical use and makes no medical claims.
Saying so plainly costs nothing and protects the project's credibility with a technical jury.

## Gate

Every item in the submission checklist in `docs/BOUNTY.md` is ticked, the demo runs under three
minutes, and the Mainnet hash resolves on a public explorer.
