# Mainnet runbook

Purpose: make the required Mainnet transaction a mechanical ten-minute procedure rather than
something improvised under deadline pressure.

**Nothing in this document may be executed until Pollar grants Mainnet access AND the owner
approves the spend at that moment.** As of 2026-09-12 the request is still "Under review".

## Before anything

- [ ] Mainnet access confirmed granted (dashboard no longer shows "Under review")
- [ ] Owner present and approving this specific transaction
- [ ] TestNet flow rehearsed end to end so the only new variable is the network

## What Mainnet actually costs

The bounty asks for "1 USDC". That is the payment, not the total. Budget for:

| Item                                 | Approximate cost                          |
| ------------------------------------ | ----------------------------------------- |
| The transaction itself               | 1 USDC                                    |
| Base reserve per user wallet created | ~1 XLM each, paid by the app wallet       |
| Trustline reserve per wallet         | Sponsored by the app wallet               |
| Transaction fees                     | 0.00001 XLM each, trivial but non-zero    |
| Starting balance per wallet          | Whatever `Starting XLM balance` is set to |

A Pollar admin confirmed on 2026-09-12 that reserves are **not** sponsored for teams: _"in this
case the teams should fund the app wallet themselves"_. They offered to send XLM if needed — take
that up rather than buying on an exchange, where KYC can take longer than the deadline allows.

Budget roughly 10–15 XLM in the application wallet plus 1–2 USDC.

## Step 1 — Fund the Mainnet application wallet

**There is no Mainnet funding wallet until access is granted.** Confirmed 2026-09-12: with the
request still "Under review", switching the dashboard toggle to **MainNet** opens the review status
modal instead of the Mainnet dashboard. So the address cannot be obtained, and cannot be given to
anyone offering to send XLM, before approval. Ask for approval first; send the address second.

Once access is granted, switch the toggle to **MainNet**. The funding wallet address there is
**different from the TestNet one**; sending to the TestNet address loses the funds.

- [ ] Copied the MainNet funding wallet public key
- [ ] Funded it with XLM (Friendbot does not exist on Mainnet)
- [ ] Balance confirmed on `https://horizon.stellar.org/accounts/<address>`

## Step 2 — Configure the Mainnet application

Everything configured on TestNet must be configured again on MainNet; it is a separate application
context.

- [ ] Allowed origins include the production Vercel domain
- [ ] **USDC enabled with the Mainnet issuer** — a different address from the TestNet one. Type the
      asset code by hand; a pasted leading space silently creates a different asset
- [ ] `Starting XLM balance` set to a non-zero value, or the first payment fails on fees
- [ ] Publishable and secret keys copied for the Mainnet application

## Step 3 — Switch the application

The network is pinned as a constant rather than an environment variable, deliberately: no
deployment can flip it by accident, and the switch is a reviewable diff.

In `src/lib/pollar/config.ts`:

```ts
export const MEDPASS_STELLAR_NETWORK: StellarNetwork = "mainnet";
```

- [ ] Constant changed and committed
- [ ] Mainnet Pollar keys set in the Vercel environment
- [ ] Redeployed, and the deployed page reports `mainnet`

`buildSettlementPayment` re-checks the network independently of this constant, so both must agree
before any payment is built.

## Step 4 — Execute

- [ ] Two wallets signed in on the production URL, both with USDC trustlines established
- [ ] Payer holds at least 1 USDC and some XLM for fees
- [ ] Provider creates a charge for **1 USDC**
- [ ] Owner reviews destination and amount on screen and approves out loud
- [ ] Patient pays
- [ ] Result is `success` or `pending` with a hash

## Step 5 — Capture the evidence

- [ ] Transaction hash recorded in `docs/POLLAR_INTEGRATION.md`
- [ ] Explorer URL opens and shows the payment:
      `https://stellar.expert/explorer/public/tx/<hash>`
- [ ] Screenshot of the in-app receipt showing the same hash
- [ ] Hash added to the Telegram submission

## If access does not arrive in time

Do not fake it and do not imply a Mainnet transaction happened. Submit with the TestNet evidence,
state plainly that Mainnet access was requested on 2026-09-11 and was still under review at the
deadline, and let the judges — who are the same team that approves access — weigh it. An honest
gap costs less than a claim that does not survive a click on the explorer link.
