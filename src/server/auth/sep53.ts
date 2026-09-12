import { createHash } from "node:crypto";
import { Keypair, StrKey } from "@stellar/stellar-base";

/**
 * SEP-53 message-signature verification.
 *
 * Pollar's `client.stellar.sep53.signMessage(message)` returns an ed25519
 * signature over `SHA-256("Stellar Signed Message:\n" + message)`. The same
 * digest is produced by external wallets and by Pollar's custodial signer, so
 * one verification path covers every wallet custody type.
 *
 * This is the only thing standing between a request and someone else's medical
 * passport, so it is deliberately small and total: every failure mode returns
 * false rather than throwing, and nothing is inferred from the caller.
 */
const SEP53_PREFIX = "Stellar Signed Message:\n";

/** Builds the exact digest SEP-53 signs. */
export function sep53Digest(message: string): Buffer {
  return createHash("sha256")
    .update(
      Buffer.concat([Buffer.from(SEP53_PREFIX, "utf8"), Buffer.from(message, "utf8")]),
    )
    .digest();
}

export function isStellarAddress(value: unknown): value is string {
  return typeof value === "string" && StrKey.isValidEd25519PublicKey(value);
}

/**
 * Verifies that `signature` proves control of `signerAddress` over `message`.
 *
 * Returns a boolean rather than throwing: a malformed address, a non-base64
 * signature, and a valid-but-wrong signature are all simply "not proven", and
 * collapsing them avoids leaking which part failed to an attacker probing the
 * endpoint.
 */
export function verifySep53Signature(input: {
  message: string;
  signature: string;
  signerAddress: string;
}): boolean {
  const { message, signature, signerAddress } = input;

  if (!isStellarAddress(signerAddress)) return false;
  if (typeof signature !== "string" || signature.length === 0) return false;
  if (typeof message !== "string" || message.length === 0) return false;

  let signatureBytes: Buffer;
  try {
    signatureBytes = Buffer.from(signature, "base64");
  } catch {
    return false;
  }

  // An ed25519 signature is exactly 64 bytes. Buffer.from ignores invalid
  // base64 characters instead of failing, so the length check is what actually
  // rejects malformed input.
  if (signatureBytes.length !== 64) return false;

  try {
    return Keypair.fromPublicKey(signerAddress).verify(
      sep53Digest(message),
      signatureBytes,
    );
  } catch {
    return false;
  }
}
