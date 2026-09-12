# Data model direction

No database objects are created in Phase 0. Likely entities are:

| Entity             | Purpose                                       | Sensitive content                    |
| ------------------ | --------------------------------------------- | ------------------------------------ |
| `profiles`         | Product identity and role linkage             | Identity/contact metadata            |
| `medical_profiles` | Patient-owned passport summary                | Health context                       |
| `medical_records`  | Typed synthetic record entries                | Allergies, medications, conditions   |
| `providers`        | Provider display and payment identity         | Organization/user metadata           |
| `access_requests`  | Requested fields, reason, duration            | Request metadata                     |
| `consents`         | Approval, scope, expiry, revocation           | Authorization evidence               |
| `encounters`       | Links provider, patient, and outcome          | Encounter metadata                   |
| `payments`         | Pollar/chain status and transaction reference | Financial metadata, no health detail |
| `audit_events`     | Append-oriented security events               | Minimal identifiers and actions      |

Records may be FHIR-inspired—`Patient`, `AllergyIntolerance`, `MedicationStatement`,
`Observation`, `Encounter`, and `DocumentReference`—without installing a FHIR server. The schema
must optimize the demo and keep a future mapping possible.

Every patient-owned row needs an ownership boundary; every access request and consent needs
explicit scope, timestamps, expiry, and revocation state. Payments link to encounters through an
internal identifier, while public transaction memo/metadata must not reveal medical information.
