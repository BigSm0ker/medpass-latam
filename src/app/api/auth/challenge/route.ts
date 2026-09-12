import { NextResponse } from "next/server";
import { issueChallenge } from "@/server/auth/challenge";

/**
 * Step 1 of sign-in: hand the client a nonce to sign.
 *
 * Unauthenticated by design — anyone may ask for a challenge. It grants
 * nothing on its own; only a valid signature over it does.
 */
export async function GET() {
  const { message, token } = issueChallenge();

  return NextResponse.json(
    { message, token },
    { headers: { "Cache-Control": "no-store" } },
  );
}
