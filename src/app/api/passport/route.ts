import { NextResponse } from "next/server";
import { passportInputSchema } from "@/schemas/passport";
import { getSession } from "@/server/auth/session";
import { getPassport, savePassport } from "@/features/passport/service";

/**
 * The patient's own passport.
 *
 * Both handlers derive the owner solely from the verified session cookie. There
 * is deliberately no route parameter or body field naming a patient: without an
 * identifier to tamper with, an insecure direct object reference is not
 * expressible here.
 */

function unauthorized() {
  return NextResponse.json(
    { error: "Inicia sesión para ver tu pasaporte." },
    { status: 401 },
  );
}

/**
 * Errors are logged with the message only and answered generically. A database
 * error can carry row contents, and this row is medical data.
 */
function serverError(context: string, error: unknown) {
  console.error(
    `[passport] ${context}:`,
    error instanceof Error ? error.message : "unknown",
  );
  return NextResponse.json(
    { error: "No se pudo acceder a tu pasaporte." },
    { status: 503 },
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const record = await getPassport(session.address);
    return NextResponse.json(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError("read", error);
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = passportInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Algunos datos no son válidos.",
        issues: parsed.error.issues.map((i) => i.path.join(".")),
      },
      { status: 422 },
    );
  }

  try {
    const record = await savePassport(session.address, parsed.data);
    return NextResponse.json(record, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError("write", error);
  }
}
