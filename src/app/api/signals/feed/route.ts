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

    const rl = await rateLimitRequest(orgId, "signals-feed", { limit: 600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const url = new URL(req.url);
    const eventType = url.searchParams.get("event_type");
    const sourceType = url.searchParams.get("source_type");
    const sinceHours = Math.min(
      Math.max(Number(url.searchParams.get("since_hours") ?? 24), 1),
      168
    );
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") ?? 50), 1),
      200
    );
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

    const params: unknown[] = [orgId];
    let where = `WHERE org_id = $1 AND created_at >= NOW() - INTERVAL '${sinceHours} hours'`;

    if (eventType) {
      params.push(eventType);
      where += ` AND event_type = $${params.length}`;
    }
    if (sourceType) {
      params.push(sourceType);
      where += ` AND source_type = $${params.length}`;
    }

    params.push(limit, offset);
    const result = await query(
      `SELECT id, source_type, source_id, event_type, entity_type,
              entity_id, data, created_at
         FROM signal_events
         ${where}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return NextResponse.json(
      {
        events: result.rows,
        count: result.rows.length,
        since_hours: sinceHours,
        limit,
        offset,
      },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Signals Feed GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
