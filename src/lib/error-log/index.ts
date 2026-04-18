import { query } from "@/lib/db";

export interface ErrorLogEntry {
  orgId?: string;
  level?: "error" | "warn" | "info";
  source: string;
  message: string;
  stack?: string;
  meta?: Record<string, unknown>;
}

export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO error_log (org_id, level, source, message, stack, meta)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.orgId || null,
        entry.level || "error",
        entry.source,
        entry.message,
        entry.stack || null,
        JSON.stringify(entry.meta || {}),
      ],
    );
  } catch (err) {
    console.error("[ErrorLog] Failed to persist error:", err);
  }
}

export interface ErrorLogRow {
  id: string;
  org_id: string | null;
  level: string;
  source: string;
  message: string;
  stack: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export async function getRecentErrors(
  orgId: string,
  limit = 50,
): Promise<ErrorLogRow[]> {
  const result = await query<ErrorLogRow>(
    `SELECT id, org_id, level, source, message, stack, meta, created_at
     FROM error_log
     WHERE org_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [orgId, limit],
  );
  return result.rows;
}

export async function getErrorStats(
  orgId: string,
  days = 7,
): Promise<{ date: string; count: number }[]> {
  const result = await query<{ date: string; count: number }>(
    `SELECT DATE(created_at) as date, COUNT(*)::int as count
     FROM error_log
     WHERE org_id = $1 AND created_at > NOW() - ($2 || ' days')::interval
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [orgId, days],
  );
  return result.rows;
}
