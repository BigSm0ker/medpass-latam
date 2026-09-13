import { NextResponse } from "next/server";
import { consentSchema } from "@/schemas/encounter";
import { getSession } from "@/server/auth/session";
import { recordConsent } from "@/features/encounters/service";

/** The patient answers. A session is required, because consent must be attributable. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Inicia sesión para responder a esta solicitud." },
      { status: 401 },
    );
  }

  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = consentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Decisión de consentimiento inválida." }, { status: 422 });
  }

  const messages: Record<string, string> = {
    not_found: "No se encontró esta solicitud.",
    expired: "Esta solicitud expiró. Pide al proveedor un nuevo código.",
    already_answered: "Esta solicitud ya fue respondida.",
  };

  try {
    const result = await recordConsent(
      session.address,
      token,
      parsed.data.decision,
      parsed.data.approvedFields,
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: messages[result.reason] },
        { status: result.reason === "not_found" ? 404 : 409 },
      );
    }

    return NextResponse.json({ status: result.status });
  } catch (error) {
    console.error(
      "[encounters] consent:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "No se pudo registrar tu decisión." },
      { status: 503 },
    );
  }
}
