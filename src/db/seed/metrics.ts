// Seed: 30 days of micro_metrics — ~6 metrics per day = ~180 rows.

import { sql } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import { microMetrics } from "@/db/schema";

import { daysAgo, isoDate, logStep, range, rng, type DemoContext } from "./util";

const METRICS = [
  { name: "response_time_avg_s", base: 8, volatility: 4 },
  { name: "leads_received", base: 12, volatility: 6 },
  { name: "appointments_booked", base: 5, volatility: 3 },
  { name: "proposals_sent", base: 3, volatility: 2 },
  { name: "close_rate_pct", base: 38, volatility: 12 },
  { name: "revenue_closed_usd", base: 8200, volatility: 5000 },
];

export async function seedMetrics(
  tx: OrgTx,
  ctx: DemoContext,
): Promise<void> {
  const [row] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(microMetrics);
  if ((row?.n ?? 0) >= 150) {
    logStep("micro_metrics", `${row.n} exist — skipping`);
    return;
  }

  const rand = rng(555);
  const DAYS = 30;
  const BATCH = 60;
  let inserted = 0;

  const allRows = range(DAYS).flatMap((dayIdx) => {
    const date = isoDate(daysAgo(DAYS - dayIdx));
    return METRICS.map((m) => {
      const value = Math.max(
        0,
        m.base + (rand() - 0.5) * m.volatility * 2,
      );
      const trend = (rand() - 0.5) * 20; // ±10% WoW

      return {
        orgId: ctx.orgId,
        metricDate: date,
        vertical: "roofing",
        metricName: m.name,
        metricValue: String(Math.round(value * 100) / 100),
        benchmark: String(m.base),
        trend: String(Math.round(trend * 10) / 10),
        data: {},
      };
    });
  });

  for (let start = 0; start < allRows.length; start += BATCH) {
    const slice = allRows.slice(start, start + BATCH);
    await tx.insert(microMetrics).values(slice);
    inserted += slice.length;
  }

  logStep("micro_metrics", `${inserted} inserted (${DAYS} days × ${METRICS.length} metrics)`);
}
