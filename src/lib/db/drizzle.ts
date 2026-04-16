// Drizzle client + per-request org context for Row-Level Security.
//
// How RLS works here:
//   - Every tenant-scoped table has a policy
//       USING (org_id = auth.org_id())
//     where `auth.org_id()` reads the GUC `app.current_org_id`.
//   - `withOrgContext(orgId, fn)` checks out a pg client, begins a
//     transaction, sets `app.current_org_id` with `SET LOCAL`, and hands
//     Drizzle to the callback. On exit (or error) the transaction commits
//     / rolls back and the GUC is automatically discarded.
//   - A fresh connection has no GUC set, so `auth.org_id()` returns NULL
//     and the RLS policy rejects every row. Forgetting to wrap a query
//     in `withOrgContext` fails closed.
//
// Usage:
//   const rows = await withOrgContext(orgId, (tx) =>
//     tx.select().from(contacts).where(eq(contacts.status, "active")),
//   );

import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import type { PoolClient } from "pg";

import * as schema from "@/db/schema";
import { pool } from "./pool";

// Lazy singleton — `drizzle(pool)` reads pool properties, which would
// throw at build time when DATABASE_URL is absent. Deferring to first
// actual use keeps `next build` happy.
let _db: NodePgDatabase<typeof schema> | null = null;
function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) _db = drizzle(pool, { schema });
  return _db;
}
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const actual = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = actual[prop as PropertyKey];
    return typeof value === "function" ? (value as Function).bind(actual) : value;
  },
});

// A transaction-scoped Drizzle instance (what `withOrgContext` passes to
// callers).
export type OrgTx = Parameters<
  Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]
>[0];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertOrgId(orgId: string): void {
  if (!orgId || !UUID_RE.test(orgId)) {
    throw new Error(
      `withOrgContext: expected a UUID string for orgId, got ${JSON.stringify(
        orgId,
      )}`,
    );
  }
}

/**
 * Run `fn` inside a transaction with `app.current_org_id` set to `orgId`.
 * RLS policies will scope every read and write to that org.
 */
export async function withOrgContext<T>(
  orgId: string,
  fn: (tx: OrgTx) => Promise<T>,
): Promise<T> {
  assertOrgId(orgId);
  return db.transaction(async (tx) => {
    // `set_config(name, value, is_local)` with is_local=true behaves like
    // SET LOCAL — the setting disappears at tx end. Using the function
    // form lets us parameterize the value safely.
    await tx.execute(sql`select set_config('app.current_org_id', ${orgId}, true)`);
    return fn(tx);
  });
}

/**
 * Escape hatch for rare admin / cross-tenant work. Use with extreme care:
 * this bypasses org isolation entirely by running as the bootstrap role
 * (RLS is still enforced, but with NULL org_id which denies all rows —
 * so this is really only useful for DDL / seeds / migrations from Node).
 */
export async function withRawClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export { schema };
