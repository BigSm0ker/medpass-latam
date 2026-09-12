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
5. **Reserve/funding sponsorship.** `EnabledAssetRecord.sponsored` and `setTrustline`'s
   server-side sponsorship decision indicate the application may cover the trustline reserve on
   TestNet. Mainnet sponsorship remains unconfirmed and is still a `[HUMAN_REQUIRED]` item.
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
