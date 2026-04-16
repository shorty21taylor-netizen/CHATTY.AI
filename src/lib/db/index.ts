import { type PoolClient, type QueryResult, type QueryResultRow } from "pg";

import { getPool, pool } from "./pool";

export { pool };

/**
 * Thin wrapper around pg.Pool.query that preserves the native QueryResult
 * shape (so callers can use `.rows`, `.rowCount`, etc.).
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await getPool().query<T>(text, params as unknown[] | undefined);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`[DB] Slow query (${duration}ms): ${text.slice(0, 120)}`);
  }
  return result;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] ?? null;
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Drizzle client + org-scoped RLS helper live in ./drizzle. Re-exported
// here so callers can `import { db, withOrgContext } from "@/lib/db"`.
export { db, withOrgContext, withRawClient, schema } from "./drizzle";
export type { OrgTx } from "./drizzle";
