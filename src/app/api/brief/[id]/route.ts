import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { query, queryOne } from "@/lib/db";
import { insertFeedback } from "@/lib/db/queries";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid brief id" }, { status: 400 });
    }

    const rl = await rateLimitRequest(orgId, "brief-read", { limit: 300 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const brief = await queryOne(
      `SELECT * FROM decision_briefs WHERE id = $1 AND org_id = $2`,
      [id, orgId]
    );
    if (!brief) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const feedback = await query(
      `SELECT id, feedback_type, feedback_text, confidence_delta, outcome_data, created_at
         FROM feedback_events
        WHERE org_id = $1 AND brief_id = $2
        ORDER BY created_at DESC`,
      [orgId, id]
    );

    return NextResponse.json(
      { brief, feedback: feedback.rows },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Brief GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Invalid brief id" }, { status: 400 });
    }

    const rl = await rateLimitRequest(orgId, "brief-feedback", { limit: 120 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retry_after: rl.resetAt.toISOString() },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = (await req.json()) as {
      feedback_type?: "action_taken" | "action_ignored" | "outcome" | "comment";
      feedback_text?: string;
      rating?: number;
      confidence_delta?: number;
      recommendation_id?: string;
      recommendation_status?: "act" | "skip" | "done";
      outcome_data?: Record<string, unknown>;
    };

    const existing = await queryOne<{
      id: string;
      operator_feedback: Record<string, unknown> | null;
    }>(
      `SELECT id, operator_feedback FROM decision_briefs
        WHERE id = $1 AND org_id = $2`,
      [id, orgId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const currentOperatorFeedback =
      (existing.operator_feedback as Record<string, unknown>) ?? {};
    const merged: Record<string, unknown> = { ...currentOperatorFeedback };

    if (typeof body.rating === "number") {
      merged.rating = Math.min(Math.max(body.rating, 1), 5);
    }
    if (typeof body.feedback_text === "string") {
      merged.comment = body.feedback_text;
    }
    if (body.recommendation_id && body.recommendation_status) {
      const statuses =
        (merged.recommendation_statuses as Record<string, string>) ?? {};
      statuses[body.recommendation_id] = body.recommendation_status;
      merged.recommendation_statuses = statuses;
    }
    merged.updated_at = new Date().toISOString();

    const updated = await queryOne(
      `UPDATE decision_briefs
          SET operator_feedback = $1
        WHERE id = $2 AND org_id = $3
        RETURNING *`,
      [JSON.stringify(merged), id, orgId]
    );

    // Log the feedback event for durable analytics.
    if (body.feedback_type) {
      await insertFeedback(orgId, {
        brief_id: id,
        feedback_type: body.feedback_type,
        feedback_text: body.feedback_text ?? null,
        confidence_delta: body.confidence_delta ?? null,
        outcome_data: {
          rating: body.rating,
          recommendation_id: body.recommendation_id,
          recommendation_status: body.recommendation_status,
          ...body.outcome_data,
        },
      }).catch((err) => console.error("[insertFeedback]", err));
    }

    return NextResponse.json(
      { brief: updated },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("[Brief PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
