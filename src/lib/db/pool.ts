// Shared singleton pg Pool. Extracted into its own module so both
// `src/lib/db/index.ts` (raw SQL helpers) and `src/lib/db/drizzle.ts`
// (Drizzle ORM client) can import it without a circular dependency.

import { Pool } from "pg";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const maxConnections = parseInt(process.env.DB_POOL_MAX || "20", 10);
  _pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: Math.min(maxConnections, 50),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
  });
  _pool.on("error", (err) => {
    console.error("[DB] Pool error:", err.message);
  });
  return _pool;
}

export function getPoolStats(): {
  total: number;
  idle: number;
  waiting: number;
} {
  const p = getPool();
  return {
    total: p.totalCount,
    idle: p.idleCount,
    waiting: p.waitingCount,
  };
}

// Proxy so `pool.query(...)` / `pool.connect()` still works for callers
// that import the pool object directly.
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const actual = getPool() as unknown as Record<PropertyKey, unknown>;
    const value = actual[prop as PropertyKey];
    return typeof value === "function" ? (value as Function).bind(actual) : value;
  },
});
