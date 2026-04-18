import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId, userId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: briefId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { recommendation_index, outcome, notes } = body as {
    recommendation_index: number;
    outcome: string;
    notes?: string;
  };

  if (recommendation_index == null || !outcome) {
    return NextResponse.json(
      { error: "recommendation_index and outcome are required" },
      { status: 400 },
    );
  }

  const validOutcomes = ["helpful", "harmful", "noop"];
  if (!validOutcomes.includes(outcome)) {
    return NextResponse.json(
      { error: "outcome must be helpful, harmful, or noop" },
      { status: 400 },
    );
  }

  try {
    const result = await queryOne<{ id: string }>(
      `INSERT INTO brief_recommendation_feedback
         (org_id, brief_id, recommendation_index, outcome, operator_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [orgId, briefId, recommendation_index, outcome, userId || null, notes || null],
    );

    await updateBriefAccuracy(orgId, briefId);

    return NextResponse.json({
      id: result?.id || "exists",
      brief_id: briefId,
      recommendation_index,
      outcome,
    });
  } catch (err) {
    console.error("[Brief Feedback] Error:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: briefId } = await params;

  try {
    const result = await query<{
      recommendation_index: number;
      outcome: string;
      notes: string | null;
      created_at: string;
    }>(
      `SELECT recommendation_index, outcome, notes, created_at
       FROM brief_recommendation_feedback
       WHERE org_id = $1 AND brief_id = $2
       ORDER BY recommendation_index`,
      [orgId, briefId],
    );

    return NextResponse.json({ feedback: result.rows });
  } catch (err) {
    console.error("[Brief Feedback GET] Error:", err);
    return NextResponse.json({ feedback: [] });
  }
}

async function updateBriefAccuracy(orgId: string, briefId: string): Promise<void> {
  try {
    const feedback = await query<{ outcome: string }>(
      `SELECT outcome FROM brief_recommendation_feedback
       WHERE org_id = $1 AND brief_id = $2`,
      [orgId, briefId],
    );

    if (feedback.rows.length === 0) return;

    const total = feedback.rows.length;
    const helpful = feedback.rows.filter((r) => r.outcome === "helpful").length;
    const harmful = feedback.rows.filter((r) => r.outcome === "harmful").length;
    const accuracy = total > 0 ? (helpful - harmful * 0.5) / total : 0;

    await query(
      `UPDATE decision_briefs SET accuracy_score = $2 WHERE id = $1 AND org_id = $3`,
      [briefId, Math.max(0, Math.min(1, accuracy)), orgId],
    );
  } catch {
    // Non-critical
  }
}
