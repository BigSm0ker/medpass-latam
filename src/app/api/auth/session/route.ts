import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";

/** Lets the client render the correct state without trusting its own guess. */
export async function GET() {
  const session = await getSession();

  return NextResponse.json(
    { address: session?.address ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
