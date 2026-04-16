// Typed query helpers for `contacts`. Every function accepts an `OrgTx`
// so the caller is forced to run them inside `withOrgContext` — RLS takes
// care of isolation but the shape is explicit.

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import type { OrgTx } from "../drizzle";
import {
  contacts,
  type Contact,
  type NewContact,
} from "@/db/schema";

export async function getByOrg(
  tx: OrgTx,
  opts: { limit?: number; offset?: number } = {},
): Promise<Contact[]> {
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  return tx
    .select()
    .from(contacts)
    .orderBy(desc(contacts.lastActivityAt), desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getById(
  tx: OrgTx,
  id: string,
): Promise<Contact | null> {
  const [row] = await tx.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return row ?? null;
}

export async function create(
  tx: OrgTx,
  input: NewContact,
): Promise<Contact> {
  const [row] = await tx.insert(contacts).values(input).returning();
  return row;
}

export async function update(
  tx: OrgTx,
  id: string,
  patch: Partial<NewContact>,
): Promise<Contact | null> {
  const [row] = await tx
    .update(contacts)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(eq(contacts.id, id))
    .returning();
  return row ?? null;
}

export async function remove(tx: OrgTx, id: string): Promise<boolean> {
  const res = await tx.delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
  return res.length > 0;
}

export async function search(
  tx: OrgTx,
  q: string,
  limit = 50,
): Promise<Contact[]> {
  const like = `%${q.replace(/[%_]/g, "\\$&")}%`;
  return tx
    .select()
    .from(contacts)
    .where(
      or(
        ilike(contacts.firstName, like),
        ilike(contacts.lastName, like),
        ilike(contacts.phone, like),
        ilike(contacts.email, like),
      ),
    )
    .orderBy(desc(contacts.lastActivityAt))
    .limit(limit);
}

export async function byType(
  tx: OrgTx,
  type: Contact["type"],
  limit = 100,
): Promise<Contact[]> {
  return tx
    .select()
    .from(contacts)
    .where(eq(contacts.type, type))
    .orderBy(desc(contacts.lastActivityAt))
    .limit(limit);
}

export async function touch(
  tx: OrgTx,
  id: string,
): Promise<void> {
  await tx
    .update(contacts)
    .set({ lastActivityAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(contacts.id, id));
}

export { contacts };
void and;
