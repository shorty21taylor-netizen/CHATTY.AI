import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateBody, decisionTriggerSchema, ValidationError } from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { runDecisionEngine } from "@/lib/decision-engine";

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 10 decision runs per hour
    const rl = await rateLimitRequest(orgId, "decision-trigger", {
      limit: 10,
      windowMs: 3600_000,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const data = validateBody(decisionTriggerSchema, body);

    // Run the 3-pass Decision Engine
    const result = await runDecisionEngine(orgId, {
      vertical: data.vertical,
      operatorName: data.operator_name,
    });

    return NextResponse.json(
      {
        success: true,
        brief_id: result.briefId,
        duration_ms: result.totalDurationMs,
        priority: result.pass3.priority,
        recommendations_count: result.pass3.recommendations.length,
      },
      { status: 200, headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Decision Trigger] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
