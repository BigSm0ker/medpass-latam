# Pollar integration baseline

Research date: **2026-09-11**. Phase 0 installs and verifies imports only; it does not create a
client, authenticate, fund a wallet, or submit a transaction.

## Official sources checked

- [Pollar documentation](https://docs.pollar.xyz/)
- [Official SDK monorepo](https://github.com/pollar-xyz/pollar)
- [Official apps/examples](https://github.com/pollar-xyz/pollar-apps)
- [Official Next.js example guide](https://github.com/pollar-xyz/pollar-docs/blob/main/docs/getting-started/example-app.md)
- npm packages [`@pollar/core`](https://www.npmjs.com/package/@pollar/core) and
  [`@pollar/react`](https://www.npmjs.com/package/@pollar/react)
- Installed package manifests and `.d.ts` declarations under `node_modules/@pollar/`

## Pinned versions

- `@pollar/core`: **0.11.3**
- `@pollar/react`: **0.11.3**

The official 0.11.3 release notes say React requires Core `^0.11.3`; exact pins should match.
Both require Node 20+ and React bindings accept React 18+.

## Confirmed integration facts

- `PollarClient` accepts an `apiKey` and defaults `stellarNetwork` to `testnet`.
- Web client construction belongs in a Client Component/provider boundary; DPoP uses browser
  cryptography and HTTPS is required outside localhost.
- React exports `PollarProvider`, `usePollar`, wallet/payment/history UI, and typed configuration.
- Core exposes authentication across email, OAuth, passkeys, and supported external wallets,
  wallet/balance state, transaction build/sign/submit paths, and history.
- Official examples use `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` in the browser and
  `POLLAR_SECRET_KEY` only in server routes. Names must still be confirmed in the owner's current
  dashboard before configuration.
- Session PII is described as memory-only in the client; persisted session data includes wallet
  and token state. Product authorization therefore cannot be inferred from UI state alone.
- The official example warns that an app-initiated `fund()` helper is unavailable; distribution
  is claim-rule based. Phase 1 must validate the actual TestNet asset-acquisition path.

## Phase 1 questions

1. Which configured dashboard auth methods best fit patient and provider demo identities?
2. Does one Pollar identity reliably map to an application subject identifier needed by server
   authorization, or is a server-side linkage/profile table required?
3. What wallet custody/activation and KYC behavior applies to the owner's TestNet application?
4. Which exact API produces a supported TestNet USDC flow and confirmed history result?
5. Are account reserve/funding costs sponsored for hackathon users, especially on Mainnet?
6. What Mainnet enablement, keys, allowlists, and transaction evidence are required?

Installed TypeScript declarations take precedence if documentation differs. Any version change
after Phase 1 starts requires explicit compatibility review and documentation.
