import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { enqueueCallTask } from "@/lib/call-tasks/registry";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "calls-enqueue", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contact_id, contact_name, phone, goal, custom_prompt, scheduled_for, agent_id, brief_id } = body as Record<string, string>;

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const validGoals = ["reengage_lead", "confirm_appointment", "followup_quote", "custom"];
  const callGoal = validGoals.includes(goal) ? goal : "custom";

  try {
    const id = await enqueueCallTask({
      orgId,
      contactId: contact_id,
      contactName: contact_name,
      contactPhone: phone,
      callGoal: callGoal as "reengage_lead" | "confirm_appointment" | "followup_quote" | "custom",
      customPrompt: custom_prompt,
      scheduledFor: scheduled_for,
      agentId: agent_id,
      briefId: brief_id,
    });

    return NextResponse.json({ id, status: "queued" }, { status: 201, headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error("[Calls Enqueue] Error:", err);
    return NextResponse.json({ error: "Failed to enqueue call" }, { status: 500 });
  }
}
