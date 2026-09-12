# Demo plan

Maximum duration: **3 minutes**.

## Storyboard

1. **0:00–0:25 — Impact:** traveler needs critical context at an unfamiliar provider; state that
   all data is synthetic and the prototype is not for clinical use.
2. **0:25–0:55 — Patient:** show critical passport fields and MedPass QR.
3. **0:55–1:30 — Consent:** provider requests selected fields; patient approves a time limit.
4. **1:30–1:55 — Provider:** show only authorized fields and start/complete the encounter.
5. **1:55–2:35 — Pollar:** patient pays about 1 USDC; show confirmation and encounter receipt.
6. **2:35–3:00 — Proof/potential:** show transaction explorer evidence and one-sentence expansion
   path.

## Release evidence

- Public repository and README integration explanation.
- Public Vercel URL in a clean browser session.
- Mainnet access and explicit transaction approval.
- Explorer URL/hash for the approved real transaction.
- Backup recording and seeded synthetic demo identities.

Rehearse failure recovery for expired consent, failed wallet login, unavailable balance, and
transaction timeout. Never expose dashboard keys or personal information while recording.
