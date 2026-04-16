// Seed: 11 agent_configs rows — one per agent type, status=not_configured.

import type { OrgTx } from "@/lib/db/drizzle";
import { agentConfigs } from "@/db/schema";

import {
  logStep,
  existingAgentMap,
  type DemoContext,
} from "./util";

const AGENT_TYPES: { type: string; name: string }[] = [
  { type: "instant_lead_response", name: "Instant Lead Response" },
  { type: "form_bot", name: "Form Bot" },
  { type: "social_dm", name: "Social DM Agent" },
  { type: "quote_follow_up", name: "Quote Follow-Up" },
  { type: "appointment_setter", name: "Appointment Setter" },
  { type: "objection_handler", name: "Objection Handler" },
  { type: "review_request", name: "Review Request" },
  { type: "dead_lead", name: "Dead Lead Reactivation" },
  { type: "ghosted_bid", name: "Ghosted Bid Follow-Up" },
  { type: "past_customer", name: "Past Customer Re-engagement" },
  { type: "telegram_ea", name: "Telegram EA" },
];

export async function seedAgents(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const existing = await existingAgentMap(tx);

  if (Object.keys(existing).length >= AGENT_TYPES.length) {
    logStep("agent_configs", `${Object.keys(existing).length} exist — skipping`);
    ctx.agentIdByType = existing;
    return;
  }

  const missing = AGENT_TYPES.filter((a) => !existing[a.type]);

  if (missing.length > 0) {
    const rows = await tx
      .insert(agentConfigs)
      .values(
        missing.map((a) => ({
          orgId: ctx.orgId,
          agentType: a.type,
          name: a.name,
          status: "not_configured" as const,
          config: {},
          completenessPct: 0,
        })),
      )
      .returning({ id: agentConfigs.id, agentType: agentConfigs.agentType });

    for (const r of rows) existing[r.agentType] = r.id;
  }

  ctx.agentIdByType = existing;
  logStep("agent_configs", `${AGENT_TYPES.length} rows ready`);
}
