# Product brief

## Vision

MedPass LATAM is a portable, patient-controlled medical passport for cross-clinic and
cross-border continuity in Latin America. It is a hackathon MVP, not a production healthcare
system or clinical decision tool.

## Primary users and job

- **Patient:** carry critical context, choose what a provider may see, and pay after an encounter.
- **Provider:** request only the necessary context, see explicit authorization, and receive USDC.

## Winning MVP path

`patient → medical passport → QR → provider request → consent → scoped provider view → encounter → Pollar payment → transaction proof`

P0 scope protects this path. Secondary profiles, analytics, document ingestion, complete FHIR
infrastructure, and advanced blockchain features are outside the hackathon MVP.

## Principles

- Synthetic/fictitious data only and a prominent not-for-clinical-use notice.
- Patient action is explicit before disclosure.
- Minimize fields, access duration, dependencies, and demo steps.
- Keep health content private/off-chain; use blockchain for wallet/payment/proof value.
- TestNet during development; Mainnet only for the approved final proof.

## Success measures

- A judge understands the problem and completes the core story within three minutes.
- The provider sees only approved fields and access can expire or be revoked.
- A payment result is associated with an encounter and independently verifiable.
- The public build is responsive, resilient, and honest about prototype limitations.
