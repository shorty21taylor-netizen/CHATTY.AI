import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import {
  getPipelineSummary,
  getDailyActivity,
  getOverdueFollowUps,
} from "@/lib/db/queries";
import { cached, orgCacheKey } from "@/lib/utils/query-cache";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "crm-pipeline", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const overdueLimit = Math.min(
      Math.max(Number(url.searchParams.get("overdue_limit") ?? 20), 1),
      100
    );

    const [pipelineRows, activityRows, overdue] = await Promise.all([
      cached(
        orgCacheKey(orgId, "pipeline"),
        async () => (await getPipelineSummary(orgId)).rows,
        30,
      ),
      cached(
        orgCacheKey(orgId, "daily_activity"),
        async () => (await getDailyActivity(orgId)).rows,
        30,
      ),
      getOverdueFollowUps(orgId, overdueLimit),
    ]);

    const totalPipelineValue = pipelineRows.reduce(
      (sum, row) => sum + Number(row.pipeline_value ?? 0),
      0
    );
    const totalOpenLeads = pipelineRows.reduce(
      (sum, row) => sum + Number(row.lead_count ?? 0),
      0
    );
    const totalInteractionsToday = activityRows.reduce(
      (sum, row) => sum + Number(row.interaction_count ?? 0),
      0
    );

    return NextResponse.json(
      {
        pipeline: pipelineRows,
        daily_activity: activityRows,
        overdue_follow_ups: overdue.rows,
        totals: {
          open_leads: totalOpenLeads,
          pipeline_value: totalPipelineValue,
          interactions_today: totalInteractionsToday,
          overdue_count: overdue.rows.length,
        },
      },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[CRM Pipeline GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
