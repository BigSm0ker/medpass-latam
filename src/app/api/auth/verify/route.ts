import { NextResponse } from "next/server";
import { sep53ProofSchema } from "@/schemas/passport";
import { verifyChallenge } from "@/server/auth/challenge";
import { verifySep53Signature } from "@/server/auth/sep53";
import { setSessionCookie } from "@/server/auth/session";

/**
 * Step 2 of sign-in: turn a wallet signature into a server session.
 *
 * The message that gets verified is rebuilt from the server-issued token, not
 * taken from the request, so a caller cannot supply a signature over text of
 * their own choosing. The address is taken from the proof and only becomes the
 * session identity once the signature over that exact message verifies.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = sep53ProofSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Prueba de inicio de sesión inválida." }, { status: 400 });
  }

  const challenge = verifyChallenge(parsed.data.token);
  if (!challenge.ok) {
    const status = challenge.reason === "expired" ? 410 : 400;
    const error =
      challenge.reason === "expired"
        ? "Esta solicitud de inicio de sesión expiró. Intenta de nuevo."
        : "Solicitud de inicio de sesión inválida.";
    return NextResponse.json({ error }, { status });
  }

  const proven = verifySep53Signature({
    message: challenge.message,
    signature: parsed.data.signature,
    signerAddress: parsed.data.signerAddress,
  });

  if (!proven) {
    return NextResponse.json({ error: "La firma no pudo verificarse." }, { status: 401 });
  }

  await setSessionCookie(parsed.data.signerAddress);

  return NextResponse.json({ address: parsed.data.signerAddress });
}
