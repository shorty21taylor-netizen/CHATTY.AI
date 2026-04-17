import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { withOrgContext } from "@/lib/db/drizzle";
import { agentCadences, contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { startCadence } from "@/lib/agents/cadence";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "cadences-test-start", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { id: cadenceId } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contactId } = body;
  if (!contactId || typeof contactId !== "string") {
    return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  }

  const valid = await withOrgContext(orgId, async (tx) => {
    const [cad] = await tx
      .select({ id: agentCadences.id })
      .from(agentCadences)
      .where(eq(agentCadences.id, cadenceId))
      .limit(1);
    if (!cad) return { ok: false as const, reason: "cadence_not_found" };

    const [contact] = await tx
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);
    if (!contact) return { ok: false as const, reason: "contact_not_found" };

    return { ok: true as const };
  });

  if (!valid.ok) {
    return NextResponse.json({ error: (valid as any).reason }, { status: 404 });
  }

  const run = await startCadence({
    orgId,
    cadenceId,
    entityType: "contact",
    entityId: contactId,
  });

  if (!run) {
    return NextResponse.json({ error: "Cadence is inactive or has no steps" }, { status: 400 });
  }

  return NextResponse.json({ run }, { status: 201, headers: rateLimitHeaders(rl) });
}
