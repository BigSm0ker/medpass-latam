import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { listEncountersForProvider } from "@/features/encounters/service";

/**
 * A provider's own recent charges.
 *
 * Scoped strictly to the caller: the session's address is what selects the
 * provider, never anything the client supplies, so one provider can never list
 * another's history.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Inicia sesión para ver tu historial." },
      { status: 401 },
    );
  }

  try {
    const history = await listEncountersForProvider(session.address, 20);
    return NextResponse.json(
      { history },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "[encounters] history:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "No se pudo cargar el historial." },
      { status: 503 },
    );
  }
}
