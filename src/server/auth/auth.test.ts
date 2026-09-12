// @vitest-environment node
import { createHash } from "node:crypto";
import { Keypair } from "@stellar/stellar-base";
import { beforeAll, describe, expect, it } from "vitest";

process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough-xxxx";
process.env.POLLAR_SECRET_KEY = "synthetic";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SECRET_KEY = "synthetic";

let issueChallenge: typeof import("./challenge").issueChallenge;
let verifyChallenge: typeof import("./challenge").verifyChallenge;
let verifySep53Signature: typeof import("./sep53").verifySep53Signature;
let sep53Digest: typeof import("./sep53").sep53Digest;
let encodeSession: typeof import("./session").encodeSession;
let decodeSession: typeof import("./session").decodeSession;

beforeAll(async () => {
  ({ issueChallenge, verifyChallenge } = await import("./challenge"));
  ({ verifySep53Signature, sep53Digest } = await import("./sep53"));
  ({ encodeSession, decodeSession } = await import("./session"));
});

/** Signs exactly as SEP-53 specifies: ed25519 over SHA-256(prefix + message). */
function signSep53(keypair: Keypair, message: string): string {
  const digest = createHash("sha256")
    .update(
      Buffer.concat([Buffer.from("Stellar Signed Message:\n"), Buffer.from(message)]),
    )
    .digest();
  return keypair.sign(digest).toString("base64");
}

describe("SEP-53 signature verification", () => {
  it("accepts a genuine signature from the claimed address", () => {
    const kp = Keypair.random();
    const message = "hello MedPass";

    expect(
      verifySep53Signature({
        message,
        signature: signSep53(kp, message),
        signerAddress: kp.publicKey(),
      }),
    ).toBe(true);
  });

  it("rejects a signature from a different wallet — the core impersonation attempt", () => {
    const owner = Keypair.random();
    const attacker = Keypair.random();
    const message = "hello MedPass";

    expect(
      verifySep53Signature({
        message,
        signature: signSep53(attacker, message),
        signerAddress: owner.publicKey(),
      }),
    ).toBe(false);
  });

  it("rejects a valid signature replayed over different text", () => {
    const kp = Keypair.random();

    expect(
      verifySep53Signature({
        message: "a different message",
        signature: signSep53(kp, "the original message"),
        signerAddress: kp.publicKey(),
      }),
    ).toBe(false);
  });

  it("rejects malformed addresses and signatures without throwing", () => {
    const kp = Keypair.random();
    const good = signSep53(kp, "m");

    expect(
      verifySep53Signature({ message: "m", signature: good, signerAddress: "nope" }),
    ).toBe(false);
    expect(
      verifySep53Signature({
        message: "m",
        signature: "!!!",
        signerAddress: kp.publicKey(),
      }),
    ).toBe(false);
    expect(
      verifySep53Signature({
        message: "",
        signature: good,
        signerAddress: kp.publicKey(),
      }),
    ).toBe(false);
  });

  it("uses the documented digest construction", () => {
    expect(sep53Digest("abc").toString("hex")).toBe(
      createHash("sha256")
        .update(
          Buffer.concat([Buffer.from("Stellar Signed Message:\n"), Buffer.from("abc")]),
        )
        .digest("hex"),
    );
  });
});

describe("challenge issuing and verification", () => {
  it("round-trips the exact message it issued", () => {
    const { message, token } = issueChallenge();
    const check = verifyChallenge(token);

    expect(check.ok).toBe(true);
    if (check.ok) expect(check.message).toBe(message);
  });

  it("rejects a token the server never issued", () => {
    const check = verifyChallenge("nonce.9999999999999.forgedsignature");
    expect(check).toEqual({ ok: false, reason: "forged" });
  });

  it("rejects a tampered expiry, because the signature covers it", () => {
    const { token } = issueChallenge();
    const [nonce, , signature] = token.split(".");
    const check = verifyChallenge(`${nonce}.${Date.now() + 999_999_999}.${signature}`);

    expect(check).toEqual({ ok: false, reason: "forged" });
  });

  it("rejects an expired challenge", () => {
    const now = Date.now();
    const { token } = issueChallenge(now);

    expect(verifyChallenge(token, now + 3 * 60 * 1000)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("rejects malformed input without throwing", () => {
    expect(verifyChallenge("nonsense").ok).toBe(false);
    expect(verifyChallenge(null).ok).toBe(false);
    expect(verifyChallenge(42).ok).toBe(false);
  });
});

describe("session cookie", () => {
  const address = Keypair.random().publicKey();

  it("round-trips a signed session", () => {
    expect(decodeSession(encodeSession(address))?.address).toBe(address);
  });

  it("refuses a session whose address was swapped for another wallet", () => {
    const encoded = encodeSession(address);
    const [, expiry, signature] = encoded.split(".");
    const attacker = Keypair.random().publicKey();

    expect(decodeSession(`${attacker}.${expiry}.${signature}`)).toBeNull();
  });

  it("refuses an unsigned or malformed cookie", () => {
    expect(decodeSession(`${address}.${Date.now() + 10_000}`)).toBeNull();
    expect(decodeSession("garbage")).toBeNull();
    expect(decodeSession(undefined)).toBeNull();
  });

  it("refuses an expired session", () => {
    const now = Date.now();
    expect(
      decodeSession(encodeSession(address, now), now + 13 * 60 * 60 * 1000),
    ).toBeNull();
  });
});
