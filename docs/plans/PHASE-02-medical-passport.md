# Phase 2 — Medical passport

## Goal

Build the smallest credible patient-owned passport using synthetic records.

## P0 slice

- Patient profile with blood type, critical allergies, current medications, relevant conditions,
  and emergency contact.
- Validated create/read/update path with clear empty/loading/error states.
- Prominent prototype disclaimer and deterministic synthetic demo seed.
- Private persistence with ownership checks and documented RLS/server authorization.

## Gate

A patient can view and edit only their synthetic passport; direct unauthorized access tests fail;
no health content reaches public chain, analytics, or unsafe logs; responsive UI is demo-ready.
