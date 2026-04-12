// Database schema + init stub.
// Real pg pool is wired in a later prompt. For now, initSchema() collects the
// additive CREATE/ALTER statements so they can be applied as soon as the pool
// is connected. All statements are idempotent.

export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS voice_notes (
    id TEXT PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS agent_configs (
    id TEXT PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS voice_notes_enabled BOOLEAN DEFAULT false`,
  `ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS voice_id TEXT`,
];

let pool = null;

export function setPool(p) {
  pool = p;
}

export async function initSchema() {
  if (!pool) return { ok: false, stub: true, statements: SCHEMA_STATEMENTS };
  for (const sql of SCHEMA_STATEMENTS) {
    await pool.query(sql);
  }
  return { ok: true };
}
