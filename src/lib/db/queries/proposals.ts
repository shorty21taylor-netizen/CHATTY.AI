// Typed query helpers for `proposals`.

import { desc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  proposals,
  type NewProposal,
  type Proposal,
} from "@/db/schema";

export async function list(
  tx: OrgTx,
  opts: { limit?: number; offset?: number } = {},
): Promise<Proposal[]> {
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  return tx
    .select()
    .from(proposals)
    .orderBy(desc(proposals.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function byStatus(
  tx: OrgTx,
  status: Proposal["status"],
  limit = 100,
): Promise<Proposal[]> {
  return tx
    .select()
    .from(proposals)
    .where(eq(proposals.status, status))
    .orderBy(desc(proposals.createdAt))
    .limit(limit);
}

export async function create(
  tx: OrgTx,
  input: NewProposal,
): Promise<Proposal> {
  const [row] = await tx.insert(proposals).values(input).returning();
  return row;
}

export async function update(
  tx: OrgTx,
  id: string,
  patch: Partial<NewProposal>,
): Promise<Proposal | null> {
  const [row] = await tx
    .update(proposals)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(proposals.id, id))
    .returning();
  return row ?? null;
}

export async function markViewed(
  tx: OrgTx,
  id: string,
): Promise<Proposal | null> {
  const [row] = await tx
    .update(proposals)
    .set({
      status: sql`case when ${proposals.status} = 'sent' then 'viewed' else ${proposals.status} end`,
      lastViewedAt: sql`now()`,
      viewCount: sql`${proposals.viewCount} + 1`,
      updatedAt: sql`now()`,
    })
    .where(eq(proposals.id, id))
    .returning();
  return row ?? null;
}

export { proposals };
