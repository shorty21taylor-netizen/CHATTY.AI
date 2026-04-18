import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCategoryConfidence } from "@/lib/decision-engine/confidence";
import { query } from "@/lib/db";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const categories = await getCategoryConfidence(orgId);

    const trend = await query<{
      brief_date: string;
      accuracy_score: number;
    }>(
      `SELECT brief_date, accuracy_score
       FROM decision_briefs
       WHERE org_id = $1 AND accuracy_score IS NOT NULL
       ORDER BY brief_date DESC
       LIMIT 30`,
      [orgId],
    );

    return NextResponse.json({
      categories,
      accuracyTrend: trend.rows.reverse(),
    });
  } catch (err) {
    console.error("[Confidence API] Error:", err);
    return NextResponse.json({ categories: [], accuracyTrend: [] });
  }
}
