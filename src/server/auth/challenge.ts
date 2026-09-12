import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/env/server";

/**
 * Login challenges.
 *
 * The challenge is stateless: rather than storing issued nonces, the server
 * signs `nonce.expiry` with its own secret and accepts the value back only if
 * the signature still verifies and the expiry has not passed. That keeps the
 * demo free of a session table while still refusing anything the server did not
 * issue and anything older than the window.
 */
const CHALLENGE_TTL_MS = 2 * 60 * 1000;

/**
 * The exact text the wallet signs.
 *
 * Defined once and derived on both the issuing and verifying side. If issuing
 * and verification ever built this string separately they could drift, and the
 * failure would look like "every valid signature is rejected" rather than like
 * a mismatched constant.
 *
 * The wording is deliberately plain: the user may see it in a wallet prompt and
 * should never be asked to sign something opaque.
 */
function buildMessage(nonce: string, expiresAt: number): string {
  return [
    "MedPass LATAM — sign in",
    "",
    "Signing proves you control this wallet. It authorizes no payment and moves no funds.",
    "",
    `Nonce: ${nonce}`,
    `Expires: ${new Date(expiresAt).toISOString()}`,
  ].join("\n");
}

function sign(payload: string): string {
  return createHmac("sha256", getServerEnv().SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

/** Constant-time comparison that tolerates length mismatch without throwing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function issueChallenge(now: number = Date.now()): {
  message: string;
  token: string;
} {
  const nonce = randomBytes(24).toString("base64url");
  const expiresAt = now + CHALLENGE_TTL_MS;
  const payload = `${nonce}.${expiresAt}`;

  return {
    message: buildMessage(nonce, expiresAt),
    token: `${payload}.${sign(payload)}`,
  };
}

export type ChallengeCheck =
  | { ok: true; message: string }
  | { ok: false; reason: "malformed" | "forged" | "expired" };

/**
 * Rebuilds the expected message from a returned challenge token.
 *
 * The message is derived here, never accepted from the client. Otherwise a
 * caller could present a valid signature over text of their own choosing and
 * the server would happily verify it.
 */
export function verifyChallenge(
  token: unknown,
  now: number = Date.now(),
): ChallengeCheck {
  if (typeof token !== "string") return { ok: false, reason: "malformed" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };

  const [nonce, expiryRaw, signature] = parts;
  if (!nonce || !expiryRaw || !signature) return { ok: false, reason: "malformed" };

  if (!safeEqual(sign(`${nonce}.${expiryRaw}`), signature)) {
    return { ok: false, reason: "forged" };
  }

  const expiresAt = Number(expiryRaw);
  if (!Number.isFinite(expiresAt)) return { ok: false, reason: "malformed" };
  if (now > expiresAt) return { ok: false, reason: "expired" };

  return { ok: true, message: buildMessage(nonce, expiresAt) };
}
