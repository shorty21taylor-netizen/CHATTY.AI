import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getRecentErrors, getErrorStats } from "@/lib/error-log";

export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 200);
  const days = Math.min(parseInt(req.nextUrl.searchParams.get("days") || "7"), 30);

  try {
    const [errors, stats] = await Promise.all([
      getRecentErrors(orgId, limit),
      getErrorStats(orgId, days),
    ]);

    return NextResponse.json({ errors, stats });
  } catch (err) {
    console.error("[AdminErrors] Failed:", err);
    return NextResponse.json({ errors: [], stats: [] });
  }
}
