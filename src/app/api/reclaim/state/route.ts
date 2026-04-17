import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { withOrgContext } from "@/lib/db/drizzle";
import { orgReclaimState } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = await withOrgContext(orgId, async (tx) => {
    const [row] = await tx
      .select()
      .from(orgReclaimState)
      .where(eq(orgReclaimState.orgId, sql`current_setting('app.current_org_id')::uuid`))
      .limit(1);
    return row ?? null;
  });

  return NextResponse.json({
    lastSweepAt: state?.lastSweepAt ?? null,
    sweepResults: state?.sweepResults ?? null,
  });
}
