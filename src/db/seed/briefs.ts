// Seed: 7 decision_briefs (one per day for the last 7 days).

import type { OrgTx } from "@/lib/db/drizzle";
import { decisionBriefs } from "@/db/schema";

import {
  daysAgo,
  existingBriefIds,
  isoDate,
  logStep,
  rng,
  type DemoContext,
} from "./util";

const SAMPLE_RECOMMENDATIONS = [
  {
    action: "Call James Rodriguez — he viewed the proposal twice yesterday",
    why: "High intent signal + 2nd view",
    expected_impact: "$18,500 roof replacement close",
    priority: "high" as const,
    category: "follow_up",
  },
  {
    action: "Send review request to Patricia Williams",
    why: "Job completed 3 days ago, 5-star Google history",
    expected_impact: "+1 Google review, social proof lift",
    priority: "medium" as const,
    category: "review",
  },
  {
    action: "Re-engage 4 dead leads from Feb campaign",
    why: "Spring season starting, monsoon prep angle",
    expected_impact: "Potential $12K pipeline",
    priority: "medium" as const,
    category: "reactivation",
  },
  {
    action: "Respond to Facebook DM from Kevin Park",
    why: "Unread for 6 hours — engagement drops >80% past 8h",
    expected_impact: "Capture warm lead before competitor",
    priority: "high" as const,
    category: "capture",
  },
  {
    action: "Block calendar for Marcus Miller site visit Thursday",
    why: "Insurance adjuster already scheduled for same day",
    expected_impact: "Smooth claims process, faster close",
    priority: "low" as const,
    category: "scheduling",
  },
];

export async function seedBriefs(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const existing = await existingBriefIds(tx);
  if (existing.length >= 7) {
    logStep("decision_briefs", `${existing.length} exist — skipping`);
    ctx.briefIds = existing.slice(0, 7);
    return;
  }

  const rand = rng(999);
  const needed = 7 - existing.length;

  const values = Array.from({ length: needed }, (_, i) => {
    const dayIdx = existing.length + i;
    const briefDate = isoDate(daysAgo(7 - dayIdx));
    const numRecs = 3 + Math.floor(rand() * 3); // 3–5
    const recs = SAMPLE_RECOMMENDATIONS.slice(0, numRecs);

    const voiceText = recs
      .map((r, j) => `${j + 1}. ${r.action}`)
      .join(" ");

    return {
      orgId: ctx.orgId,
      briefDate,
      contextId: null as string | null,
      decisionEngineTrace: {
        pass1: {
          patterns: [
            { type: "opportunity", count: numRecs },
            { type: "risk", count: 1 },
          ],
          confidence: 0.82 + rand() * 0.15,
          timestamp: daysAgo(7 - dayIdx).toISOString(),
        },
        pass2: {
          decisions: recs.map((r) => r.action),
          rationale: "Prioritized by expected revenue impact and time-sensitivity.",
          confidence: 0.85 + rand() * 0.12,
          timestamp: daysAgo(7 - dayIdx).toISOString(),
        },
        pass3: {
          brief: recs.map((r) => `• ${r.action} — ${r.why}`).join("\n"),
          recommendations: recs,
          voice_text: voiceText,
          timestamp: daysAgo(7 - dayIdx).toISOString(),
        },
        total_duration_ms: 2100 + Math.floor(rand() * 1000),
      },
      recommendations: recs,
      priority: "medium" as const,
      voiceSummaryText: voiceText,
      voiceSummaryUrl: null as string | null,
      deliveredAt: daysAgo(7 - dayIdx),
      deliveredVia: "sms",
      operatorFeedback: {},
      createdAt: daysAgo(7 - dayIdx),
    };
  });

  const rows = await tx
    .insert(decisionBriefs)
    .values(values)
    .returning({ id: decisionBriefs.id });

  const allIds = [...existing, ...rows.map((r) => r.id)];
  ctx.briefIds = allIds.slice(0, 7);
  logStep("decision_briefs", `${allIds.length} total (${needed} inserted)`);
}
