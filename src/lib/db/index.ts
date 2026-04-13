import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  _pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  _pool.on("error", (err) => {
    console.error("[DB] Pool error:", err.message);
  });
  return _pool;
}

// Proxy so `pool.query(...)` / `pool.connect()` still works for existing callers.
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const actual = getPool() as unknown as Record<PropertyKey, unknown>;
    const value = actual[prop as PropertyKey];
    return typeof value === "function" ? (value as Function).bind(actual) : value;
  },
});

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
