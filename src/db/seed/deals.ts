// Seed: 30 deals distributed across pipeline stages.

import { sql } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import { deals } from "@/db/schema";

import { daysAgo, logStep, pick, rng, type DemoContext } from "./util";

type Stage = "new_lead" | "qualified" | "proposal_sent" | "negotiation" | "closing" | "won" | "lost";

// Roughly mirrors a healthy pipeline: many up top, fewer at bottom.
const STAGE_DISTRIBUTION: Stage[] = [
  "new_lead", "new_lead", "new_lead", "new_lead", "new_lead", "new_lead",
  "qualified", "qualified", "qualified", "qualified", "qualified",
  "proposal_sent", "proposal_sent", "proposal_sent", "proposal_sent",
  "negotiation", "negotiation", "negotiation",
  "closing", "closing",
  "won", "won", "won", "won", "won",
  "lost", "lost", "lost", "lost", "lost",
];

export async function seedDeals(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const [row] = await tx.select({ n: sql<number>`count(*)::int` }).from(deals);
  if ((row?.n ?? 0) >= 30) {
    logStep("deals", `${row.n} exist — skipping`);
    return;
  }

  const rand = rng(200);
  const values = STAGE_DISTRIBUTION.map((stage, i) => {
    const ago = Math.floor(rand() * 60);
    const value = 3000 + Math.round(rand() * 30000);

    return {
      orgId: ctx.orgId,
      contactId: ctx.contactIds[i % ctx.contactIds.length],
      proposalId: ctx.proposalIds[i % ctx.proposalIds.length] ?? null,
      stage,
      valueUsd: String(value),
      daysInStage: Math.floor(rand() * 21),
      assignedAgentId:
        rand() > 0.5
          ? (ctx.agentIdByType["quote_follow_up"] ?? null)
          : null,
      lastActivityAt: daysAgo(ago),
      lastActivityNote: pick(rand, [
        "Follow-up sent",
        "Proposal viewed",
        "Callback requested",
        "Signed — payment incoming",
        "Lost to competitor",
        null,
      ]),
      createdAt: daysAgo(ago + Math.floor(rand() * 30)),
    };
  });

  await tx.insert(deals).values(values);
  logStep("deals", "30 inserted");
}
