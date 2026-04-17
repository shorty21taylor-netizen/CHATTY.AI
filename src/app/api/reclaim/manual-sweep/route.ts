import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import { inngest } from "@/inngest/client";

export async function POST(_req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "reclaim-manual-sweep", { limit: 2 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  await inngest.send({
    name: "reclaim/sweep-org",
    data: { orgId },
  });

  return NextResponse.json(
    { status: "triggered", orgId },
    { status: 202, headers: rateLimitHeaders(rl) },
  );
}
