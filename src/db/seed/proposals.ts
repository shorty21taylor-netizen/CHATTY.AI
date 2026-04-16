// Seed: 15 proposals at various stages.

import type { OrgTx } from "@/lib/db/drizzle";
import { proposals } from "@/db/schema";

import {
  daysAgo,
  existingProposalIds,
  logStep,
  pick,
  rng,
  type DemoContext,
} from "./util";

const TITLES = [
  "Full Roof Replacement — Asphalt Shingle",
  "Insurance Claim Re-roof",
  "Metal Roof Upgrade",
  "Tile Roof Repair + Underlayment",
  "Flat Roof Coating System",
  "Emergency Tarp + Repair",
  "Soffit & Fascia Replacement",
  "Gutter System Install",
  "Skylight Replacement + Flashing",
  "Roof Inspection + Maintenance Plan",
  "Two-story Shingle Tear-off",
  "Patio Roof Extension",
  "Commercial Flat Roof Section",
  "Hail Damage Repair — Insurance",
  "Standing Seam Metal — Custom Color",
];

const STATUSES: Array<"draft" | "sent" | "viewed" | "won" | "lost" | "expired"> = [
  "sent", "sent", "viewed", "viewed", "won",
  "won", "won", "lost", "lost", "draft",
  "sent", "viewed", "won", "expired", "viewed",
];

export async function seedProposals(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const existing = await existingProposalIds(tx);
  if (existing.length >= 15) {
    logStep("proposals", `${existing.length} exist — skipping`);
    ctx.proposalIds = existing.slice(0, 15);
    return;
  }

  const rand = rng(77);
  const needed = 15 - existing.length;

  const values = Array.from({ length: needed }, (_, i) => {
    const idx = existing.length + i;
    const ago = 5 + Math.floor(rand() * 80);
    const status = STATUSES[idx % STATUSES.length];
    const amount = 4000 + Math.round(rand() * 28000);

    return {
      orgId: ctx.orgId,
      contactId: ctx.contactIds[idx % ctx.contactIds.length],
      title: TITLES[idx % TITLES.length],
      serviceType: "roofing",
      amountUsd: String(amount),
      status,
      sentAt: status !== "draft" ? daysAgo(ago) : null,
      lastViewedAt: status === "viewed" || status === "won" ? daysAgo(ago - 2) : null,
      viewCount: status === "viewed" ? 1 + Math.floor(rand() * 3) : 0,
      notes: null as string | null,
      createdAt: daysAgo(ago + 2),
    };
  });

  const rows = await tx.insert(proposals).values(values).returning({ id: proposals.id });
  const allIds = [...existing, ...rows.map((r) => r.id)];
  ctx.proposalIds = allIds.slice(0, 15);
  logStep("proposals", `${allIds.length} total (${needed} inserted)`);
}
