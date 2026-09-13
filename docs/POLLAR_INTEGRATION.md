# Pollar integration baseline

Research date: **2026-09-11**. Phase 1 verification date: **2026-09-12**.

Phase 0 installed and verified imports only. Phase 1 established the adapter, the credential
boundary, and the exact API surface below, read from the installed `0.11.3` TypeScript
declarations rather than from documentation or memory.

## Official sources checked

- [Pollar documentation](https://docs.pollar.xyz/)
- [Official SDK monorepo](https://github.com/pollar-xyz/pollar)
- [Official apps/examples](https://github.com/pollar-xyz/pollar-apps)
- npm packages [`@pollar/core`](https://www.npmjs.com/package/@pollar/core) and
  [`@pollar/react`](https://www.npmjs.com/package/@pollar/react)
- Installed `.d.ts` declarations under `node_modules/@pollar/` — **authoritative**

## Pinned versions

- `@pollar/core`: **0.11.3**
- `@pollar/react`: **0.11.3**

Both require Node 20+; React bindings accept React 18+. Any version change requires an explicit
compatibility review and an update to this document.

## Verified API surface

Read from `node_modules/@pollar/core/dist/index.d.ts` and
`node_modules/@pollar/react/dist/index.d.ts`. Only these members are used.

### Client construction

`new PollarClient(config: PollarClientConfig)` where the relevant fields are `apiKey` (required),
`stellarNetwork?: 'mainnet' | 'testnet'`, `deviceLabel?`, and `logLevel?`. `PollarProvider` accepts
either a constructed `PollarClient` or a `PollarClientConfig` and locks it at first render.

### `usePollar()` context members used

`isAuthenticated`, `verified`, `wallet`, `wallets`, `network`, `setNetwork`, `login`, `logout`,
`openLoginModal`, `walletBalance`, `refreshWalletBalance`, `enabledAssets`, `refreshAssets`,
`setTrustline`, `sendPayment`, `txHistory`, and `getClient`.

`verified` is distinct from `isAuthenticated`: a session restored optimistically from storage
reports `isAuthenticated: true` before the server has revalidated it. Wallet-scoped requests and
any signing action are gated on `verified`.

### Client methods reached through `getClient()`

`listDistributionRules()`, `claimDistributionRule({ ruleId })`, and `fetchTxHistory(params?)`.
These have no `usePollar()` equivalent.

### Payment

`sendPayment(params: SendPaymentParams): Promise<SubmitOutcome>`. For Stellar the params are
`{ chain: 'STELLAR', destination, amount, asset }` where a credit asset is
`{ type: 'credit_alphanum4', code, issuer }` and `amount` is a decimal string.

`SubmitOutcome` is a three-way union: `success` and `pending` both carry a `hash`, while `error`
carries only optional `hash`, `details`, `resultCode`, `code`, and `message`. `pending` means the
network accepted the transaction but the ledger has not confirmed it, so a receipt must not claim
settlement on `pending`.

### Asset discovery

The USDC issuer is **never hard-coded**. `refreshAssets()` populates `enabledAssets` with the
application's dashboard catalog for the active network as `EnabledAssetRecord[]`
(`code`, `issuer`, `chain`, `trustlineEstablished`, `sponsored`). The issuer differs between
TestNet and Mainnet, so resolving it at runtime is what makes the Mainnet switch a configuration
change rather than a code change.

Balances come separately from `refreshWalletBalance()` as `WalletBalanceRecord[]`, which
distinguishes `balance` (held) from `available` (spendable after reserves and liabilities).
Affordability is judged against `available`.

### TestNet asset acquisition — resolved

There is no app-initiated `fund()` helper, confirming the Phase 0 warning. Distribution is
claim-rule based: `listDistributionRules()` returns
`{ id, name, assetCode, amount, period, claimable, reason }` and `claimDistributionRule({ ruleId })`
returns `{ ruleId, assetCode, amount, txHash }`. `txHash` is legitimately nullable — the server may
settle a claim without surfacing a hash — so a null hash is a successful claim, not a failure.

Rules must be configured in the Pollar dashboard for the application. If no rule exists, the spike
page reports an empty list and test USDC must be obtained through the dashboard instead.

## Credential boundary

- `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` is browser-safe and validated in `src/lib/env/client.ts`.
- `POLLAR_SECRET_KEY` is server-only, validated in `src/lib/env/server.ts`, and guarded by a
  runtime check that throws if the module is ever evaluated in a browser context.
- A production build was scanned: the publishable key appears in the client bundle as expected and
  the secret key does not appear at all.
- `@pollar/core` degrades to a no-op when constructed server-side, so the SDK is mounted only in a
  Client Component. `POLLAR_SECRET_KEY` is reserved for future server-to-server calls and is not
  yet used by any code path.

## Network policy

`MEDPASS_STELLAR_NETWORK` in `src/lib/pollar/config.ts` is pinned to `testnet` as a constant, not
as an environment variable, so no deployment can flip it by accident. `buildSettlementPayment`
independently re-checks the network and refuses to construct any payload outside it — a second
line of defense behind the pinned config.

## Resolved Phase 1 questions

1. **Auth methods.** `login({ provider })` supports `google`, `github`, and `email` (with
   `sendEmailCode` / `verifyEmailCode`), plus passkey smart wallets and external Stellar wallets
   (Freighter, Albedo). The demo uses whichever methods the owner's dashboard has enabled; the
   hosted login modal (`openLoginModal`) renders exactly those.
2. **Identity mapping.** `getUserProfile()` returns in-memory PII only and is never persisted;
   `wallet.address` is the stable on-chain identifier. See ADR-002 for the resulting decision.
3. **Wallet custody.** `WalletInfo.custody` is `internal` (platform-custodied), `smart` (passkey
   C-address), or `external`. Custody is fixed at account creation. KYC helpers exist
   (`getKycStatus`, `startKyc`) but are **not** exercised — no agent performs KYC.
4. **TestNet USDC flow.** Resolved above via distribution rules plus `sendPayment`.
5. **Reserve/funding sponsorship — resolved.** Not sponsored. A Pollar admin confirmed on
   2026-09-12 that "the teams should fund the app wallet themselves", offering to send XLM if the
   team has trouble. The application's own wallet pays roughly 2 XLM of Stellar base reserve per
   user wallet it creates. On TestNet this is free via Friendbot; on Mainnet it is a real cost that
   must be budgeted on top of the bounty's ~1 USDC transaction.
6. **Mainnet deltas.** Switching requires: `MEDPASS_STELLAR_NETWORK` changed to `mainnet`, a
   Mainnet-enabled dashboard application and publishable key, a Mainnet USDC issuer present in the
   enabled-assets catalog, a funded account meeting the Stellar base reserve, and explicit human
   approval at execution time. No code path may make this switch automatically.

## Known limitations

- The spike proves the adapter and the credential boundary. Live TestNet execution against the
  owner's dashboard application still has to be run by a human in a browser — the adapter cannot
  complete an interactive login on its own.
- Distribution rules and enabled assets both depend on dashboard configuration this repository
  does not control.

## Live TestNet observations — 2026-09-12

Recorded from an authenticated, server-verified session against the owner's dashboard application.

| Observation             | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| Auth methods offered    | email, Google, Wallet                                   |
| `isAuthenticated`       | `true`                                                  |
| `verified`              | `true`                                                  |
| Wallet custody          | `internal` (platform-custodied)                         |
| Network reported by SDK | `testnet`                                               |
| `existsOnStellar`       | `false` — deferred funding; no asset has reached it yet |
| Enabled assets          | `XLM` only, with `enabledInApp: false`; **no USDC**     |
| Distribution rules      | `[]` — no faucet configured                             |
| Balances                | `[]`                                                    |
| Transaction hash        | not yet obtained — blocked by the two rows above        |

Confirmed working: origin allowlisting, application config fetch, hosted login modal, session
verification, custodial wallet creation, and the pinned TestNet endpoint. The adapter's
"not enabled for this app" message is correct behaviour reporting a real configuration gap, not a
defect.

Confirmed blocked: asset catalog and TestNet funding. Both are dashboard configuration and are
tracked in `docs/MANUAL_ACTIONS.md`. A payment cannot be built until a USDC issuer resolves, and
the wallet cannot hold USDC until the Stellar account exists and carries a trustline.

## Funding model — corrected 2026-09-12

An earlier reading of the Phase 0 notes assumed distribution rules were the primary way a wallet
gets its first assets. The dashboard setup checklist corrects this.

The application holds its own wallet, and that wallet pays the Stellar base reserve — about 2 XLM —
for every user wallet it creates. An unfunded app wallet therefore cannot create user wallets at
all, which is exactly what `existsOnStellar: false` reports. Distribution rules are a separate,
optional faucet feature layered on top; they are not what activates an account.

Trustlines are an independent gate. A user wallet holds XLM by default and nothing else; holding
USDC requires the application to enable trustlines and the wallet to establish one. This is why the
enabled-asset catalog returned only XLM.

Practical consequence for Phase 5: the Mainnet proof requires real XLM in the application wallet
before any USDC can move, so the transaction cost is the reserve plus the payment, not the payment
alone.

## Phase 1 acceptance evidence — TestNet payment confirmed 2026-09-12

The critical path is proven end to end. Every value below was read back from Horizon, not from
the application's own UI.

| Item                  | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Transaction hash      | `5ce00279e8883b8e59a361e592a1c9c7de2dac717b7b14bf1212a60bf8e0f3f6`                                            |
| Ledger                | 4633398                                                                                                       |
| Result                | `successful: true` — SDK returned `SubmitOutcome.status: "success"`                                           |
| Amount / asset        | 1.0000000 USDC                                                                                                |
| USDC issuer (TestNet) | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`                                                    |
| From (patient)        | `GD2IOJAIUM6VBYHXXOXP3OMG7XPPH3MR2SQOAM6JKTTEHHDIEYEXG7P4`                                                    |
| To (provider)         | `GBXRPE4IWADDFKWRHQWMGXK3H7OE5JFM5AKS5SB4IMV2DCM4ULOUWM73`                                                    |
| Fee charged           | 100 stroops (0.00001 XLM), paid by the sending wallet                                                         |
| Wallet custody        | `internal` (platform-custodied)                                                                               |
| Balances after        | payer 19 USDC, receiver 1 USDC                                                                                |
| Explorer              | <https://stellar.expert/explorer/testnet/tx/5ce00279e8883b8e59a361e592a1c9c7de2dac717b7b14bf1212a60bf8e0f3f6> |

`sendPayment` returned `success` directly rather than `pending`, so for this application a
confirmed receipt is available immediately. Phase 4 must still handle `pending`, since the SDK
types allow it and network conditions can produce it.

## `existsOnStellar` goes stale against the ledger — observed 2026-09-13

The spike page reported `Exists on Stellar: false` and empty `USDC held` / `USDC spendable` for
`GD2IOJAIUM6VBYHXXOXP3OMG7XPPH3MR2SQOAM6JKTTEHHDIEYEXG7P4` — the same wallet that had already sent
the confirmed payment above. Horizon, read directly, disagreed on every point:

| Field                  | Spike page (SDK)     | Horizon (ledger)                                           |
| ---------------------- | -------------------- | ---------------------------------------------------------- |
| Account exists         | `false`              | exists — `last_modified_ledger: 4633398`                    |
| USDC balance           | `—`                  | `19.0000000` USDC, issuer `GBBD47IF6…FLA5`, `is_authorized` |
| XLM balance            | not shown            | `9999.9999900` native                                       |
| Trustline              | `established (sponsored)` | `subentry_count: 1`, `num_sponsored: 3`                |
| Sponsor                | not shown            | `GCGWO4V2JTH3PZSLFGHNCMMVGN7WO4KYPVOEUMICWQ3EOEEBWLLG7F3N`  |

Note which row was *right*: the trustline. It comes from the enabled-asset catalog
(`refreshAssets`), a different source from the wallet object, and it matched the ledger. Only the
fields carried on the wallet object itself were stale.

So `wallet.existsOnStellar` is a snapshot taken when the wallet object is issued, not a live read,
and a session restored from browser storage can carry a snapshot from before the account was
funded. `refreshWalletBalance()` does not appear to refresh it; signing out and back in does.

The earlier entry under *Live TestNet observations* reads `existsOnStellar: false — deferred
funding`. That diagnosis was right for that moment — the account genuinely did not exist yet — but
it should not be read as meaning the field tracks the ledger afterwards. It does not.

**Consequence.** Treat `existsOnStellar` and SDK-reported balances as hints for UI, never as proof
of on-chain state, and never as a precondition the product blocks on. Horizon is the source of
truth for every claim this project makes, which is already the rule every acceptance table in this
document follows. Worth restating before the Mainnet cutover: a stale `false` there must not be
mistaken for an unfunded Mainnet wallet.

## Setup sequence that actually works

Discovered empirically; each step blocks the next, and skipping one produces a misleading error.

1. **Allowed origins** — without the dev origin, `/applications/config` returns
   `403 ORIGIN_NOT_ALLOWED` and the login modal reports "Could not load sign-in options", which
   reads like a network fault but is not.
2. **Fund the application wallet** — it pays roughly 1 XLM of sponsored base reserve per user
   wallet. Unfunded, no user wallet is created and `existsOnStellar` stays false.
3. **Register the asset exactly** — the asset code is part of the asset's on-chain identity.
   A stray leading space produced code `" USDC"` typed as `credit_alphanum12`, which the dashboard
   flagged `Invalid` and which correctly failed to match the real `USDC` `credit_alphanum4` asset.
   Never trim or normalize this client-side: a tolerated space would build payments against a
   different asset that merely looks like USDC.
4. **Log in again** — funding and token changes apply to existing accounts only on next login.
5. **Establish the trustline** — sponsored by the application when configured, so the user pays
   nothing.
6. **Obtain test USDC** — Circle's faucet at <https://faucet.circle.com> (select USDC + Stellar
   Testnet) delivers 20 USDC, limited to one request per asset/network every 2 hours. This
   application has no distribution rules; that faucet feature is optional and unused.
7. **Fund the user wallet with XLM** — **the sponsored reserve does not cover transaction fees.**
   With `Starting XLM balance: 0` the wallet holds zero spendable XLM and `sendPayment` fails with
   "Not enough XLM to cover the network fee". Fixed here via Friendbot; the durable fix is a
   non-zero starting balance in the dashboard's Funding Mode.

## Mainnet deltas

Beyond the network pin and a Mainnet-enabled key: the USDC issuer is different and must be
registered separately; Friendbot does not exist, so both the application wallet and every user
wallet need real XLM; and per the Pollar admin, reserves are not sponsored for teams. Budget real
XLM for reserves and fees on top of the ~1 USDC transaction.

## Known limitations

- `GET /wallet/balance` intermittently answers `{"chain":"STELLAR","error":"unreadable"}` while
  Horizon returns the balances correctly, so the UI shows a dash for held/spendable USDC. Transient
  and upstream; the payment path is unaffected.
- `existsOnStellar` continued to report `false` in the SDK's wallet object after the account was
  demonstrably created on-chain. Do not gate product logic on that flag; read balances or assets.
- The dashboard's `Invalid` badge is advisory. The blocking condition it reported was `unfunded`,
  not the badge.
