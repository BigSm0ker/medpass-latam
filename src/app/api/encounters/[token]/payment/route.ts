import { NextResponse } from "next/server";
import { paymentRecordSchema } from "@/schemas/encounter";
import { getSession } from "@/server/auth/session";
import { getPatientEncounter, getProviderAddress } from "@/features/encounters/service";
import { recordPayment } from "@/features/encounters/payments";

/**
 * Tells the patient where to pay, and records the result.
 *
 * GET answers with the provider's payout address and the amount, so the browser
 * decides neither. A destination supplied by the client would let a tampered
 * page redirect a real payment to an attacker.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Inicia sesión para pagar." }, { status: 401 });

  const { token } = await params;

  try {
    const encounter = await getPatientEncounter(session.address, token);
    if (!encounter) {
      return NextResponse.json(
        { error: "No se encontró este cobro." },
        { status: 404 },
      );
    }

    const destination = await getProviderAddress(token);
    if (!destination) {
      return NextResponse.json(
        { error: "Este proveedor no tiene una dirección de cobro configurada." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        encounterId: encounter.id,
        destination,
        amountUsdc: encounter.amount_usdc,
        status: encounter.status,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[encounters] payment read:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "No se pudo preparar el pago." },
      { status: 503 },
    );
  }
}

/**
 * Records what Pollar answered.
 *
 * The amount is read from the encounter, never from the request body, so a
 * client cannot claim to have paid a different sum than the one it was charged.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Inicia sesión para pagar." }, { status: 401 });

  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = paymentRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Resultado de pago inválido." }, { status: 422 });
  }

  try {
    const encounter = await getPatientEncounter(session.address, token);
    if (!encounter) {
      return NextResponse.json(
        { error: "No se encontró este cobro." },
        { status: 404 },
      );
    }

    await recordPayment({
      encounterId: encounter.id,
      amountUsdc: encounter.amount_usdc,
      status: parsed.data.status,
      txHash: parsed.data.txHash ?? null,
      failureReason: parsed.data.failureReason ?? null,
    });

    return NextResponse.json({ status: parsed.data.status });
  } catch (error) {
    console.error(
      "[encounters] payment write:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "No se pudo registrar el pago." },
      { status: 503 },
    );
  }
}
