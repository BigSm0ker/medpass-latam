# Supabase instructions

- Read `docs/DATA_MODEL.md`, `docs/SECURITY.md`, and ADR-003 first.
- Use migrations for every schema or policy change; never edit production data manually.
- Default tables and storage to private and apply least-privilege RLS.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Use synthetic medical data only.
- Phase 0 contains no database migration. Do not create one without phase authorization.
