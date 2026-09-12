import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { revokeConsent } from "@/features/encounters/service";

/** The patient withdraws access. Takes effect on the provider's next read. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to revoke access." }, { status: 401 });
  }

  const { token } = await params;

  try {
    const result = await revokeConsent(session.address, token);
    if (!result.ok) {
      return NextResponse.json(
        { error: "This request was not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ status: "revoked" });
  } catch (error) {
    console.error(
      "[encounters] revoke:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "Could not revoke access." }, { status: 503 });
  }
}
