# Bounty engineering checklist

Source: official `Bounty Pollar — Buildathon Cochabamba 2026` PDF, read 2026-09-12.
Working submission deadline: **2026-09-13 23:59 America/La_Paz**.

## Prize and framing

200 USDC total: **120 first place, 80 second**. Paid in USDC to a Vaquita account on closing day.
If only one team qualifies it takes 120; if none qualifies, nothing is awarded. Only two places
exist, so "qualifying" and "placing" are different bars.

What they ask for, verbatim: _"Una aplicación real que resuelva un problema del día a día en
Bolivia o Latinoamérica, con Pollar como motor de pagos y funcionando en mainnet."_ Their example
ideas are all commerce and money movement — shop and restaurant payments, freelancer invoicing,
remittances between cities or countries, group savings/pasanakus, and paying bills, tuition or
rent.

**Consequence for MedPass, stated plainly:** the brief is payments-first, and MedPass is
consent-first with a payment at the end. That is a positioning risk against both Impact (30%) and
Pollar integration (25%), not a disqualification. The submission must lead with the payment problem
— paying a clinic that takes no cards, or paying from another country — and present the consent
layer as what makes that payment trustworthy, not the other way round.

Gambling, casinos, trading, speculation and memecoins are excluded. MedPass is unaffected.

## Hard participation requirements

1. Mainnet access form submitted (required before any Mainnet work is possible).
2. Pollar integrated in at least one real flow — wallet, charge, payment or ramp.
3. One real Mainnet transaction through Pollar. **1 USDC is enough.**
4. Public repository with a README explaining how Pollar was integrated.
5. Public URL the judges can try — <https://medpass-latam.vercel.app/>.
6. Demo of at most 3 minutes, live or recorded.

## Submission, via the bounty Telegram group before closing

- [ ] Project name, team and members
- [ ] Description of at most **300 words**
- [ ] Repository link, public URL, and demo video (or notice of a live demo)
- [ ] **Mainnet transaction hash**
- [ ] **Vaquita account to receive the prize**

The Pollar team is online in the Telegram group all three days and explicitly invites early
questions.

## Impact — 30%

**Plan:** demonstrate a concrete LATAM continuity problem through a traveler/emergency scenario,
portable patient-controlled context, explicit consent, and a short bilingual-friendly narrative.

**Proof required:** working patient/provider path, clear privacy framing, concise pitch.

## Potential — 25%

**Plan:** preserve clean identity, consent, encounter, payment, and audit boundaries; document a
future FHIR-inspired interoperability direction without building a FHIR server.

**Proof required:** architecture and roadmap showing how additional providers, countries, and
standards can fit without claiming they already exist.

## Pollar integration — 25%

**Plan:** make Pollar onboarding/wallet and payment part of the end-user encounter rather than a
detached crypto demo. Prove the critical path on TestNet in Phase 1 and keep SDK usage centralized.

**Proof required:** wallet state, USDC payment interaction, confirmation/history, error states,
and README integration explanation.

## Real transactions — 20%

**Plan:** TestNet first. Near release, after Mainnet access and explicit owner approval, execute
the smallest permitted transaction (approximately 1 USDC) and capture the transaction hash.

**Proof required:** public explorer result, UI receipt associated with the encounter, and demo
evidence. No Phase 0 transaction is allowed.

## Submission P0 checklist

- [x] Public-repository-ready code and documentation
- [x] Reproducible local toolchain and secret-free CI
- [x] Public GitHub repository: <https://github.com/BigSm0ker/medpass-latam>
- [x] Public Vercel URL: <https://medpass-latam.vercel.app/>
- [ ] Pollar integration in a real flow
- [ ] Mainnet access confirmed
- [ ] Explicit approval for approximately 1 USDC transaction
- [ ] Mainnet transaction recorded
- [ ] Demo recorded/live and no longer than three minutes
