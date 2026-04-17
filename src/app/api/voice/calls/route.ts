import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db/drizzle";
import { voiceCalls } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "voice-calls-read", { limit: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const calls = await db
    .select()
    .from(voiceCalls)
    .where(eq(voiceCalls.orgId, orgId))
    .orderBy(desc(voiceCalls.startedAt))
    .limit(50);

  return NextResponse.json({ calls }, { headers: rateLimitHeaders(rl) });
}
