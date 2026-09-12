import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server";

/**
 * The privileged Supabase client.
 *
 * This client uses the service-role key and therefore bypasses RLS entirely.
 * That is intentional — Supabase Auth is not in use, so the database cannot
 * know who the caller is (ADR-002) — but it means every ownership decision has
 * to be made by the code that calls this client. Nothing here may ever be
 * imported into a Client Component; `server-only` turns that mistake into a
 * build error rather than a credential leak.
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const env = getServerEnv();
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-medpass-context": "server" } },
  });

  return cached;
}
