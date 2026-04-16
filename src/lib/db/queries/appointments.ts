// Typed query helpers for `appointments`. Every function accepts an
// `OrgTx` so the caller must run them inside `withOrgContext`.

import { and, asc, desc, eq, gte, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  appointments,
  type Appointment,
  type NewAppointment,
} from "@/db/schema";

export async function list(
  tx: OrgTx,
  opts: { limit?: number; offset?: number } = {},
): Promise<Appointment[]> {
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  return tx
    .select()
    .from(appointments)
    .orderBy(desc(appointments.scheduledAt))
    .limit(limit)
    .offset(offset);
}

export async function upcoming(
  tx: OrgTx,
  limit = 50,
): Promise<Appointment[]> {
  return tx
    .select()
    .from(appointments)
    .where(gte(appointments.scheduledAt, sql`now()`))
    .orderBy(asc(appointments.scheduledAt))
    .limit(limit);
}

export async function byContact(
  tx: OrgTx,
  contactId: string,
): Promise<Appointment[]> {
  return tx
    .select()
    .from(appointments)
    .where(eq(appointments.contactId, contactId))
    .orderBy(desc(appointments.scheduledAt));
}

export async function create(
  tx: OrgTx,
  input: NewAppointment,
): Promise<Appointment> {
  const [row] = await tx.insert(appointments).values(input).returning();
  return row;
}

export async function update(
  tx: OrgTx,
  id: string,
  patch: Partial<NewAppointment>,
): Promise<Appointment | null> {
  const [row] = await tx
    .update(appointments)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(appointments.id, id))
    .returning();
  return row ?? null;
}

export async function updateStatus(
  tx: OrgTx,
  id: string,
  status: Appointment["status"],
): Promise<Appointment | null> {
  return update(tx, id, { status });
}

export { appointments };
void and;
