import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { withOrgContext } from "@/lib/db/drizzle";
import { reviewRequestLinks } from "@/db/schema";
import { sql, gte } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await params;

  const result = await withOrgContext(orgId, async (tx) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [row] = await tx
      .select({
        totalClicks: sql<number>`COALESCE(SUM(${reviewRequestLinks.clicksCount}), 0)`,
      })
      .from(reviewRequestLinks)
      .where(gte(reviewRequestLinks.createdAt, thirtyDaysAgo));
    return row;
  });

  return NextResponse.json({ totalClicks: Number(result?.totalClicks ?? 0) });
}
