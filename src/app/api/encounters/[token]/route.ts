import { NextResponse } from "next/server";
import { getRequestView } from "@/features/encounters/service";

/**
 * What the QR resolves to.
 *
 * Deliberately unauthenticated: whoever holds the code is the intended patient,
 * and they must see what is being asked of them before signing in or disclosing
 * anything. The payload carries no health content and no patient identifier, so
 * the token grants nothing except the right to answer this one request.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const view = await getRequestView(token);
    if (!view)
      return NextResponse.json(
        { error: "This request was not found." },
        { status: 404 },
      );

    return NextResponse.json(view, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(
      "[encounters] read:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Could not load this request." },
      { status: 503 },
    );
  }
}
