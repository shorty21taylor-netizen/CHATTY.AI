import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateBody, decisionTriggerSchema, ValidationError } from "@/lib/utils/validate";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    await inngest.send({
      name: "decision/run",
      data: {
        orgId,
        vertical: data.vertical,
        operatorName: data.operator_name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Decision engine run dispatched",
        dispatched_at: new Date().toISOString(),
      },
      { status: 202, headers: rateLimitHeaders(rl) }
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
