import { z } from "zod";

/**
 * Server-only environment contract.
 *
 * Importing this module from a Client Component is a security defect, not a
 * style problem: it would place `POLLAR_SECRET_KEY` and `SUPABASE_SECRET_KEY`
 * into a browser bundle. The runtime guard below turns that mistake into an
 * immediate, obvious failure rather than a silent leak.
 */
const serverEnvSchema = z.object({
  POLLAR_SECRET_KEY: z.string().min(1, "POLLAR_SECRET_KEY is required"),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a URL"),
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is required"),
  /**
   * Signs session cookies. Without it, a forged cookie would be indistinguishable
   * from a real one, so a missing value is a hard failure rather than a default.
   */
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

function assertServerRuntime(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "Server environment was imported in a browser context. " +
        "Move this import behind a Server Component, Route Handler, or Server Action.",
    );
  }
}

/**
 * Parses server-only environment once per runtime.
 *
 * Error messages name variables, never values.
 */
export function getServerEnv(): ServerEnv {
  assertServerRuntime();
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    POLLAR_SECRET_KEY: process.env.POLLAR_SECRET_KEY,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration: ${missing}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Reports whether server credentials are configured without reading or
 * returning them. Safe to use in a health/diagnostics response.
 */
export function hasServerPollarKey(): boolean {
  assertServerRuntime();
  return Boolean(process.env.POLLAR_SECRET_KEY);
}
