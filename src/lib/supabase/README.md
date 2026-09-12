# Supabase boundary

Phase 0 installs the client but does not configure a project. Future code will separate
browser-safe, server, and service-role access. Service-role credentials must remain server-only,
and anonymous database access is denied unless an explicitly documented RLS policy permits it.
