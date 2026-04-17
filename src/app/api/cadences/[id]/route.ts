import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { withOrgContext } from "@/lib/db/drizzle";
import { agentCadences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "cadences-update", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.exitConditions !== undefined) updates.exitConditions = body.exitConditions;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await withOrgContext(orgId, async (tx) => {
    const [row] = await tx
      .update(agentCadences)
      .set(updates)
      .where(eq(agentCadences.id, id))
      .returning();
    return row ?? null;
  });

  if (!updated) {
    return NextResponse.json({ error: "Cadence not found" }, { status: 404 });
  }

  return NextResponse.json({ cadence: updated }, { headers: rateLimitHeaders(rl) });
}
