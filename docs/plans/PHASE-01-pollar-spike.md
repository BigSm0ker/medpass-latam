# Phase 1 — Pollar technical spike

## Goal

Prove the critical Pollar path early on TestNet using the owner's actual dashboard configuration
and current installed SDK APIs.

## P0 slice

- Configure publishable/server credentials locally with validated client/server separation.
- Prove supported onboarding/authentication and stable application identity behavior.
- Observe wallet creation/activation, address, network, balance, and unavailable/error states.
- Obtain a supported TestNet asset safely; execute and confirm a TestNet USDC/supported-asset
  transaction and history/result flow.
- Record exact APIs, types, configuration, evidence, limitations, and Mainnet deltas.

## Gate

A repeatable local TestNet flow works without speculative calls; no secret reaches Git/browser
incorrectly; authentication ADR is resolved; payment adapter surface is narrow and tested; all
unknowns affecting Mainnet/demo are logged. Stop before medical features.
