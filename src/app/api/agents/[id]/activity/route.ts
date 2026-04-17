import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { withOrgContext } from "@/lib/db/drizzle";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import * as agents from "@/lib/db/queries/agents";
import { AGENT_TYPES } from "@/lib/agents/registry";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!AGENT_TYPES.find((a: any) => a.id === id)) {
    return NextResponse.json({ error: "Unknown agent type" }, { status: 404 });
  }

  const rl = await rateLimitRequest(orgId, "agents-activity", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const data = await withOrgContext(orgId, async (tx) => {
    const config = await agents.getConfig(tx, id);
    if (!config) return { runs: [], activities: [] };

    const runs = await agents.recentRuns(tx, config.id, 50);
    const activities = await agents.recentActivity(tx, config.id, 50);

    return { runs, activities };
  });

  return NextResponse.json(data, { headers: rateLimitHeaders(rl) });
}
