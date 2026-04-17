import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { AGENT_TYPES } from "@/lib/agents/registry";
import { dispatchAgentsForEvent } from "@/lib/agents/dispatcher";
import { getLeadById } from "@/lib/db/queries";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!AGENT_TYPES.find((a: any) => a.id === id)) {
    return NextResponse.json({ error: "Unknown agent type" }, { status: 404 });
  }

  const rl = await rateLimitRequest(orgId, "agents-test-run", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { leadId } = body;
  if (!leadId || typeof leadId !== "string") {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }

  const lead = await getLeadById(orgId, leadId);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const agentType = AGENT_TYPES.find((a: any) => a.id === id);
  const eventType = (agentType as any)?.defaultEventType ?? "lead_received";

  const result = await dispatchAgentsForEvent({
    orgId,
    eventType,
    entityType: "lead",
    entityId: lead.id,
    data: {
      lead_id: lead.id,
      contact_id: lead.contact_id,
      title: lead.title,
      service_type: lead.service_type,
      status: lead.status,
      priority: lead.priority,
      estimated_value: lead.estimated_value,
      source: lead.source,
    },
  });

  return NextResponse.json({ result }, { headers: rateLimitHeaders(rl) });
}
