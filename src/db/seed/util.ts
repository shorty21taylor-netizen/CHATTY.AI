// Shared helpers for the seed modules under src/db/seed/*.
//
// Every seeder accepts an `OrgTx` and a small `DemoContext` that
// accumulates ids produced by earlier steps (so contacts can reference
// agents, deals can reference proposals, etc). Seeds are idempotent:
// each module checks for existing rows and either skips or fills its
// slice of `ctx` from the DB.

import { asc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "@/lib/db/drizzle";
import {
  contacts,
  agentConfigs,
  proposals as proposalsTable,
  decisionBriefs,
} from "@/db/schema";

// Note: agentConfigs, proposalsTable, decisionBriefs are used in helper
// functions below. `countContacts` uses `contacts`.

// -- Deterministic RNG ------------------------------------------------------
// A seeded linear congruential generator so repeated seeds produce the
// same (recognizable) demo data. Not cryptographic; fine for fixtures.

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// -- Demo context -----------------------------------------------------------

export const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";

export type DemoContext = {
  orgId: string;
  contactIds: string[];
  agentIdByType: Record<string, string>;
  proposalIds: string[];
  briefIds: string[];
};

export function makeContext(): DemoContext {
  return {
    orgId: DEMO_ORG_ID,
    contactIds: [],
    agentIdByType: {},
    proposalIds: [],
    briefIds: [],
  };
}

// -- Logging ----------------------------------------------------------------

export function logStep(label: string, info: string | number) {
  // eslint-disable-next-line no-console
  console.log(`  ${label.padEnd(22)} ${info}`);
}

// -- Idempotency helpers ----------------------------------------------------

export async function countContacts(tx: OrgTx): Promise<number> {
  const [row] = await tx.select({ n: sql<number>`count(*)::int` }).from(contacts);
  return row?.n ?? 0;
}

export async function existingContactIds(tx: OrgTx): Promise<string[]> {
  const rows = await tx
    .select({ id: contacts.id })
    .from(contacts)
    .orderBy(asc(contacts.createdAt));
  return rows.map((r) => r.id);
}

export async function existingAgentMap(
  tx: OrgTx,
): Promise<Record<string, string>> {
  const rows = await tx.select().from(agentConfigs);
  const map: Record<string, string> = {};
  for (const r of rows) map[r.agentType] = r.id;
  return map;
}

export async function existingProposalIds(tx: OrgTx): Promise<string[]> {
  const rows = await tx
    .select({ id: proposalsTable.id })
    .from(proposalsTable)
    .orderBy(asc(proposalsTable.createdAt));
  return rows.map((r) => r.id);
}

export async function existingBriefIds(tx: OrgTx): Promise<string[]> {
  const rows = await tx
    .select({ id: decisionBriefs.id })
    .from(decisionBriefs)
    .orderBy(asc(decisionBriefs.briefDate));
  return rows.map((r) => r.id);
}

// -- Date helpers -----------------------------------------------------------

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// -- Re-exports -------------------------------------------------------------

export { eq };
