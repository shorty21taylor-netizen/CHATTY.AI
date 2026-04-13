import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query } from "@/lib/db";

type MetricRow = {
  metric_name: string;
  metric_value: string | number | null;
  benchmark: string | number | null;
  trend: string | number | null;
  vertical: string | null;
  metric_date: string;
};

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "metrics-read", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const days = Math.min(
      Math.max(Number(url.searchParams.get("days") ?? 7), 1),
      90
    );

    // Latest value per metric.
    const latest = await query<MetricRow>(
      `SELECT DISTINCT ON (metric_name)
              metric_name, metric_value, benchmark, trend, vertical, metric_date
         FROM micro_metrics
        WHERE org_id = $1
        ORDER BY metric_name, metric_date DESC`,
      [orgId]
    );

    // History for sparklines — last N days grouped by metric_name.
    const history = await query<MetricRow>(
      `SELECT metric_name, metric_value, metric_date
         FROM micro_metrics
        WHERE org_id = $1
          AND metric_date >= CURRENT_DATE - ($2::int || ' days')::interval
        ORDER BY metric_name, metric_date ASC`,
      [orgId, days]
    );

    const trendsByName: Record<
      string,
      { date: string; value: number | null }[]
    > = {};
    for (const row of history.rows) {
      (trendsByName[row.metric_name] ??= []).push({
        date: row.metric_date,
        value: row.metric_value === null ? null : Number(row.metric_value),
      });
    }

    const metrics = latest.rows.map((row) => ({
      metric_name: row.metric_name,
      metric_value:
        row.metric_value === null ? null : Number(row.metric_value),
      benchmark: row.benchmark === null ? null : Number(row.benchmark),
      trend: row.trend === null ? null : Number(row.trend),
      vertical: row.vertical,
      metric_date: row.metric_date,
      sparkline: trendsByName[row.metric_name] ?? [],
    }));

    return NextResponse.json(
      { metrics, days },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Metrics GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
