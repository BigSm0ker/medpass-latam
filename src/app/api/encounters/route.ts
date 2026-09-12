import { NextResponse } from "next/server";
import { createEncounterSchema } from "@/schemas/encounter";
import { getSession } from "@/server/auth/session";
import { createEncounter } from "@/features/encounters/service";

/** A provider opens a charge. The session decides who the provider is. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to create a charge." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = createEncounterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the amount, reason and requested fields.",
        issues: parsed.error.issues.map((issue) => issue.path.join(".")),
      },
      { status: 422 },
    );
  }

  try {
    const created = await createEncounter(session.address, parsed.data);
    return NextResponse.json(created, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "[encounters] create:",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Could not create the charge." },
      { status: 503 },
    );
  }
}
