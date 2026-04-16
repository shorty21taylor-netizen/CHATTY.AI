// Typed query helpers for decision_briefs.

import { desc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  decisionBriefs,
  type DecisionBrief,
  type NewDecisionBrief,
} from "@/db/schema";

export async function today(tx: OrgTx): Promise<DecisionBrief | null> {
  const [row] = await tx
    .select()
    .from(decisionBriefs)
    .where(sql`${decisionBriefs.briefDate} = current_date`)
    .orderBy(desc(decisionBriefs.createdAt))
    .limit(1);
  return row ?? null;
}

export async function byDate(
  tx: OrgTx,
  date: string, // YYYY-MM-DD
): Promise<DecisionBrief | null> {
  const [row] = await tx
    .select()
    .from(decisionBriefs)
    .where(eq(decisionBriefs.briefDate, date))
    .limit(1);
  return row ?? null;
}

export async function recent(
  tx: OrgTx,
  limit = 14,
): Promise<DecisionBrief[]> {
  return tx
    .select()
    .from(decisionBriefs)
    .orderBy(desc(decisionBriefs.briefDate))
    .limit(limit);
}

export async function create(
  tx: OrgTx,
  input: NewDecisionBrief,
): Promise<DecisionBrief> {
  const [row] = await tx.insert(decisionBriefs).values(input).returning();
  return row;
}

export async function markDelivered(
  tx: OrgTx,
  id: string,
  via: string,
): Promise<DecisionBrief | null> {
  const [row] = await tx
    .update(decisionBriefs)
    .set({ deliveredAt: sql`now()`, deliveredVia: via })
    .where(eq(decisionBriefs.id, id))
    .returning();
  return row ?? null;
}

export { decisionBriefs };
