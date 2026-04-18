import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getTopAgents, getAgentMetrics } from "@/lib/agent-metrics/rollup";

export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date") || undefined;
  const agentId = req.nextUrl.searchParams.get("agent_id");
  const days = parseInt(req.nextUrl.searchParams.get("days") || "7", 10);

  try {
    if (agentId) {
      const metrics = await getAgentMetrics(orgId, agentId, days);
      return NextResponse.json({ metrics });
    }
    const metrics = await getTopAgents(orgId, date, 20);
    return NextResponse.json({ metrics });
  } catch (err) {
    console.error("[Agent Metrics API] Error:", err);
    return NextResponse.json({ metrics: [] });
  }
}
