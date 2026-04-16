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

// Proxy so `pool.query(...)` / `pool.connect()` still works for callers
// that import the pool object directly.
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const actual = getPool() as unknown as Record<PropertyKey, unknown>;
    const value = actual[prop as PropertyKey];
    return typeof value === "function" ? (value as Function).bind(actual) : value;
  },
});
