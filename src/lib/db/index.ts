import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => { console.error("[DB] Pool error:", err.message); });

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) console.warn(`[DB] Slow query (${duration}ms)`);
  return result.rows;
}

export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEBSˆŠNÂˆÛÛœİ™\İ[H]ØZ]Ø[˜XÚÊÛY[
NÂˆ]ØZ]ÛY[œ]Y\JÓÓSRUŠNÂˆ™]\›ˆ™\İ[ÂˆHØ]Ú
\œ›ÜŠHÂˆ]ØZ]ÛY[œ]Y\J”“ÓPÒÈŠNÂˆ›İÈ\œ›ÜÂˆHš[˜[HÈÛY[œ™[X\ÙJ
NÈBŸB‚™^ÜÈÛÛNÂ™^ÜY˜][È]Y\K]Y\SÛ™K˜[œØXİ[Û‹ÛÛNÂ