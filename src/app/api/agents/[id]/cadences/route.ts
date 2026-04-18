import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { withOrgContext } from "@/lib/db/drizzle";
import { agentCadences, cadenceSteps, agentConfigs } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: agentConfigId } = await params;

  const cadences = await withOrgContext(orgId, async (tx) => {
    const rows = await tx
      .select()
      .from(agentCadences)
      .where(eq(agentCadences.agentConfigId, agentConfigId));

    if (rows.length === 0) return [];

    const cadenceIds = rows.map((c) => c.id);
    const allSteps = await tx
      .select()
      .from(cadenceSteps)
      .where(inArray(cadenceSteps.cadenceId, cadenceIds))
      .orderBy(cadenceSteps.stepIndex);

    const stepsByCadence = new Map<string, typeof allSteps>();
    for (const step of allSteps) {
      const arr = stepsByCadence.get(step.cadenceId) || [];
      arr.push(step);
      stepsByCadence.set(step.cadenceId, arr);
    }

    return rows.map((cad) => ({
      ...cad,
      steps: stepsByCadence.get(cad.id) || [],
    }));
  });

  return NextResponse.json({ cadences });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "cadences-create", { limit: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { id: agentConfigId } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, exitConditions, steps } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json({ error: "steps array is required and must not be empty" }, { status: 400 });
  }

  const cadence = await withOrgContext(orgId, async (tx) => {
    const [ac] = await tx
      .select({ id: agentConfigs.id })
      .from(agentConfigs)
      .where(eq(agentConfigs.id, agentConfigId))
      .limit(1);

    if (!ac) return null;

    const [cad] = await tx
      .insert(agentCadences)
      .values({
        orgId,
        agentConfigId,
        name,
        totalSteps: steps.length,
        exitConditions: exitConditions ?? { reply_received: true, booked: true, opted_out: true },
      })
      .returning();

    const stepRows = steps.map((s: any, i: number) => ({
      cadenceId: cad.id,
      stepIndex: i,
      delaySeconds: s.delaySeconds ?? 0,
      channel: s.channel ?? "sms",
      promptOverride: s.promptOverride ?? null,
      templateSnippet: s.templateSnippet ?? null,
    }));

    await tx.insert(cadenceSteps).values(stepRows);

    await tx
      .update(agentConfigs)
      .set({ cadenceId: cad.id })
      .where(eq(agentConfigs.id, agentConfigId));

    const insertedSteps = await tx
      .select()
      .from(cadenceSteps)
      .where(eq(cadenceSteps.cadenceId, cad.id))
      .orderBy(cadenceSteps.stepIndex);

    return { ...cad, steps: insertedSteps };
  });

  if (!cadence) {
    return NextResponse.json({ error: "Agent config not found" }, { status: 404 });
  }

  return NextResponse.json({ cadence }, { status: 201, headers: rateLimitHeaders(rl) });
}
