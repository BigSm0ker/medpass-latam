import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getDisclosure } from "@/features/encounters/service";
import { getPayment } from "@/features/encounters/payments";

/**
 * The provider's view: only the approved fields, only while consent is live.
 *
 * The refusal reason is returned on purpose. A clinician who suddenly sees
 * nothing needs to know whether the patient withdrew access or the window simply
 * elapsed — those call for different responses in the room.
 */
const REFUSALS: Record<string, { status: number; message: string }> = {
  not_found: { status: 404, message: "This charge was not found." },
  not_consented: {
    status: 409,
    message: "The patient has not approved this request yet.",
  },
  revoked: { status: 403, message: "The patient withdrew access to this information." },
  expired: { status: 403, message: "Access to this information has expired." },
  no_fields: {
    status: 403,
    message: "The patient approved none of the requested fields.",
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to view this charge." },
      { status: 401 },
    );
  }

  const { token } = await params;

  try {
    const disclosure = await getDisclosure(session.address, token);

    if (!disclosure.allowed) {
      const refusal = REFUSALS[disclosure.reason] ?? REFUSALS.not_found;
      return NextResponse.json(
        { error: refusal.message, reason: disclosure.reason },
        { status: refusal.status },
      );
    }

    const payment = await getPayment(disclosure.encounter.id);

    return NextResponse.json(
      { ...disclosure, payment },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[encounters] disclosure:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "Could not load this charge." }, { status: 503 });
  }
}
