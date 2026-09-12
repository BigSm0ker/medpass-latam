# Phase 3 — Charge with consent (revised 2026-09-12)

## Why this replaces the original split

The original plan built consent (Phase 3) and payment (Phase 4) as separate flows. Reading the
official bounty PDF changed that. The brief asks for Pollar as the **payments engine** solving a
daily problem, and its first worked example is _"cobros para tiendas, restaurantes o negocios de
barrio"_. A consent flow with a payment bolted on afterwards scores badly against both Impact (30%)
and Pollar integration (25%), which grades "depth of the flow and the end-user experience".

Fusing them fixes the positioning and costs less to build: one QR, one approval screen, one
Pollar transaction. The product stops being "a medical record that also charges" and becomes
"a charge that carries medical context" — which is the same code telling a better, truer story.

## The single flow

`provider creates a charge → QR → patient scans → patient sees requested fields and amount →
patient approves scope, duration and payment → provider receives only the approved fields →
patient pays USDC through Pollar → receipt bound to the encounter`

## P0 slice

- Provider states an amount, the exact fields needed, and a reason.
- The QR carries an opaque token only: no health data, no patient identifier, no bearer authority
  over anything but this one encounter.
- The patient sees what is being asked for **before** disclosing anything.
- The patient approves a subset of the requested fields and a short duration.
- The provider is served strictly the approved fields, and only while consent is live.
- Expiry and revocation deny access and are observable.
- Payment runs through the Phase 1 adapter and its result is recorded against the encounter.

## Gate

Two roles in two separate sessions complete the flow. A provider asking for five fields and granted
two receives two. Expired and revoked consent return nothing. The QR contents reveal no health
data. The payment receipt shows a verifiable transaction.

## Deliberately out of scope

Audit dashboards, revocation history UI, provider directories, and multi-encounter management.
They cost demo time and earn no points against the published criteria.
