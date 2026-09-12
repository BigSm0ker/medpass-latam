import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env/server";
import { isStellarAddress } from "./sep53";

/**
 * Server session.
 *
 * The cookie carries the proven Stellar address and is HMAC-signed, so the
 * client can read who it is but cannot become somebody else. It is httpOnly
 * and sameSite=lax so page scripts and cross-site requests cannot lift it.
 *
 * This cookie is the ONLY source of caller identity for the passport API. An
 * address in a request body or query string is never trusted.
 */
export const SESSION_COOKIE = "medpass_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type Session = { address: string; expiresAt: number };

function sign(payload: string): string {
  return createHmac("sha256", getServerEnv().SESSION_SECRET)
    .update(payload)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function encodeSession(address: string, now: number = Date.now()): string {
  const expiresAt = now + SESSION_TTL_MS;
  const payload = `${address}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns null for anything that is not a currently valid, server-issued session. */
export function decodeSession(
  value: unknown,
  now: number = Date.now(),
): Session | null {
  if (typeof value !== "string") return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;

  const [address, expiryRaw, signature] = parts;
  if (!address || !expiryRaw || !signature) return null;
  if (!safeEqual(sign(`${address}.${expiryRaw}`), signature)) return null;

  const expiresAt = Number(expiryRaw);
  if (!Number.isFinite(expiresAt) || now > expiresAt) return null;

  // Re-validate the address even though it was checked at issue time: the
  // signature only proves we produced this string, and a bug elsewhere must not
  // turn into a malformed lookup key.
  if (!isStellarAddress(address)) return null;

  return { address, expiresAt };
}

export async function setSessionCookie(address: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(address), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** The authenticated caller, or null. Every protected route starts here. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
