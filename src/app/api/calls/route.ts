import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCallTasks } from "@/lib/call-tasks/registry";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "calls-list", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    const tasks = await getCallTasks(orgId, 50);
    return NextResponse.json({ calls: tasks }, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    console.error("[Calls List] Error:", err);
    return NextResponse.json({ error: "Failed to load calls" }, { status: 500 });
  }
}
