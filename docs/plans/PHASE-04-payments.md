# Phase 4 — Encounter and payment

## Goal

Tie a completed healthcare encounter to a confirmed Pollar payment.

## P0 slice

- Provider completes a synthetic encounter and presents amount/destination clearly.
- Patient reviews and submits a TestNet USDC payment through the Phase 1 adapter.
- Pending/success/failure states are idempotent and recoverable.
- Receipt stores transaction reference/status against the encounter without medical chain metadata.

## Gate

The full demo path completes reliably on TestNet and shows verifiable transaction history. Mainnet
configuration remains disabled pending explicit release-time approval.
