import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { feedbackEvents } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    brief_id: string;
    feedback_type: "action_taken" | "action_ignored" | "outcome" | "comment";
    feedback_text?: string;
    confidence_delta?: number;
    outcome_data?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.brief_id || !body.feedback_type) {
    return NextResponse.json(
      { error: "brief_id and feedback_type are required" },
      { status: 400 },
    );
  }

  const [row] = await db
    .insert(feedbackEvents)
    .values({
      orgId,
      briefId: body.brief_id,
      feedbackType: body.feedback_type,
      feedbackText: body.feedback_text || null,
      confidenceDelta: body.confidence_delta != null ? String(body.confidence_delta) : null,
      outcomeData: body.outcome_data || {},
    })
    .returning();

  return NextResponse.json({ feedback: row });
}
