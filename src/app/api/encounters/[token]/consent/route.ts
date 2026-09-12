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
      { error: "Sign in to answer this request." },
      { status: 401 },
    );
  }

  const { token } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = consentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid consent decision." }, { status: 422 });
  }

  const messages: Record<string, string> = {
    not_found: "This request was not found.",
    expired: "This request expired. Ask the provider for a new one.",
    already_answered: "This request was already answered.",
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
      { error: "Could not record your decision." },
      { status: 503 },
    );
  }
}
