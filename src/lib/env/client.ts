import { z } from "zod";

/**
 * Browser-safe environment contract.
 *
 * Only `NEXT_PUBLIC_*` values may live here. Each variable is referenced as a
 * static `process.env.NEXT_PUBLIC_*` member expression so the Next.js compiler
 * can inline it; destructuring or dynamic lookup silently yields `undefined`
 * in client bundles.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY is required"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cached: ClientEnv | null = null;

/**
 * Parses the browser-safe environment once per runtime.
 *
 * Throws a message that names the missing variables without printing any
 * value, so a misconfigured deployment fails loudly but never leaks a key
 * into a log or an error overlay.
 */
export function getClientEnv(): ClientEnv {
  if (cached) return cached;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid browser environment configuration: ${missing}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Non-throwing probe for UI that must render an "unavailable" state instead of
 * crashing when the app is deployed without Pollar credentials.
 */
export function hasClientPollarKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY);
}
