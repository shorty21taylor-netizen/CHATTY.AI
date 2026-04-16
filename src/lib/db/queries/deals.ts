// Typed query helpers for `deals`.

import { desc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import { deals, type Deal, type NewDeal } from "@/db/schema";

export async function byStage(
  tx: OrgTx,
  stage: Deal["stage"],
  limit = 100,
): Promise<Deal[]> {
  return tx
    .select()
    .from(deals)
    .where(eq(deals.stage, stage))
    .orderBy(desc(deals.lastActivityAt))
    .limit(limit);
}

export async function pipelineValue(
  tx: OrgTx,
): Promise<
  { stage: Deal["stage"]; count: number; total_value: string }[]
> {
  const rows = await tx
    .select({
      stage: deals.stage,
      count: sql<number>`count(*)::int`,
      total_value: sql<string>`coalesce(sum(${deals.valueUsd}), 0)::text`,
    })
    .from(deals)
    .groupBy(deals.stage);
  return rows;
}

export async function create(tx: OrgTx, input: NewDeal): Promise<Deal> {
  const [row] = await tx.insert(deals).values(input).returning();
  return row;
}

export async function update(
  tx: OrgTx,
  id: string,
  patch: Partial<NewDeal>,
): Promise<Deal | null> {
  const [row] = await tx
    .update(deals)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(deals.id, id))
    .returning();
  return row ?? null;
}

export async function moveStage(
  tx: OrgTx,
  id: string,
  stage: Deal["stage"],
  note?: string,
): Promise<Deal | null> {
  const [row] = await tx
    .update(deals)
    .set({
      stage,
      daysInStage: 0,
      lastActivityAt: sql`now()`,
      lastActivityNote: note ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(deals.id, id))
    .returning();
  return row ?? null;
}

export { deals };
