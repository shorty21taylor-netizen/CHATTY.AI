import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { withOrgContext } from "@/lib/db/drizzle";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";
import * as agents from "@/lib/db/queries/agents";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "agents-list", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const rows = await withOrgContext(orgId, (tx) => agents.listByOrg(tx));
  return NextResponse.json({ agents: rows }, { headers: rateLimitHeaders(rl) });
}
