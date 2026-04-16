// Typed query helpers for signal_events.

import { desc, eq, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  signalEvents,
  type NewSignalEvent,
  type SignalEvent,
} from "@/db/schema";

export async function ingest(
  tx: OrgTx,
  input: NewSignalEvent,
): Promise<SignalEvent> {
  const [row] = await tx.insert(signalEvents).values(input).returning();
  return row;
}

export async function recent(
  tx: OrgTx,
  limit = 50,
): Promise<SignalEvent[]> {
  return tx
    .select()
    .from(signalEvents)
    .orderBy(desc(signalEvents.createdAt))
    .limit(limit);
}

export async function byType(
  tx: OrgTx,
  eventType: string,
  limit = 100,
): Promise<SignalEvent[]> {
  return tx
    .select()
    .from(signalEvents)
    .where(eq(signalEvents.eventType, eventType))
    .orderBy(desc(signalEvents.createdAt))
    .limit(limit);
}

export async function since(
  tx: OrgTx,
  isoDate: string,
  limit = 500,
): Promise<SignalEvent[]> {
  return tx
    .select()
    .from(signalEvents)
    .where(sql`${signalEvents.createdAt} >= ${isoDate}`)
    .orderBy(desc(signalEvents.createdAt))
    .limit(limit);
}

export { signalEvents };
