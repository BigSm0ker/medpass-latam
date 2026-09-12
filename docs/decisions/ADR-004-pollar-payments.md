# ADR-004: Centralize Pollar and prove TestNet first

- **Status:** Accepted for spike; final flow pending Phase 1
- **Date:** 2026-09-11

## Context

Pollar integration and a real transaction represent 45% of the judging score. The SDK is evolving,
and invented APIs or a late integration failure would threaten submission.

## Decision

Pin `@pollar/core` and `@pollar/react` at matching 0.11.3 versions. Centralize raw SDK use in
`src/lib/pollar/`. Phase 1 proves supported authentication, wallet, TestNet asset/balance,
transaction, and history/result paths before medical feature work. Tie the eventual payment to an
encounter rather than building a disconnected wallet demo.

Mainnet is reserved for one minimal, explicitly approved release proof. No Mainnet or funding
operation is allowed automatically.

## Consequences

Installed types take precedence over docs. Any upgrade requires compatibility review. The team
must resolve dashboard configuration, TestNet asset acquisition, Mainnet approval, and possible
Stellar reserve responsibility early.
