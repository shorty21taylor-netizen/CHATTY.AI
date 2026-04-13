import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await rateLimitRequest(orgId, "brief-list", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") ?? 30), 1),
      100
    );
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    const result = await query(
      `SELECT id, brief_date, priority, delivered_at, delivered_via,
              recommendations, voice_summary, operator_feedback, created_at
         FROM decision_briefs
        WHERE org_id = $1
        ORDER BY brief_date DESC, created_at DESC
        LIMIT $2 OFFSET $3`,
      [orgId, limit, offset]
    );

    return NextResponse.json(
      { briefs: result.rows, count: result.rows.length, limit, offset },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Brief List GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
