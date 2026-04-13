import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query, queryOne } from "@/lib/db";

export async function GET(_req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "brief-today", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    // Most recent brief — prefer today's, fall back to the latest if none.
    const brief = await queryOne(
      `SELECT *
         FROM decision_briefs
        WHERE org_id = $1
        ORDER BY brief_date DESC, created_at DESC
        LIMIT 1`,
      [orgId]
    );

    // Signal summary for today's window (last 24h).
    const signalSummary = await query<{
      event_type: string;
      source_type: string;
      count: string;
    }>(
      `SELECT event_type, source_type, COUNT(*)::text AS count
         FROM signal_events
        WHERE org_id = $1
          AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY event_type, source_type
        ORDER BY COUNT(*) DESC`,
      [orgId]
    );

    // Latest micro-metrics for the KPI strip.
    const metrics = await query(
      `SELECT DISTINCT ON (metric_name)
              metric_name, metric_value, benchmark, trend,
              vertical, metric_date
         FROM micro_metrics
        WHERE org_id = $1
        ORDER BY metric_name, metric_date DESC`,
      [orgId]
    );

    return NextResponse.json(
      {
        brief,
        signal_summary: signalSummary.rows,
        micro_metrics: metrics.rows,
      },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Brief Today GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
