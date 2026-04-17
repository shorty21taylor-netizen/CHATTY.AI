import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { agentSimulations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(agentSimulations)
    .where(eq(agentSimulations.orgId, orgId))
    .orderBy(desc(agentSimulations.createdAt))
    .limit(50);

  return NextResponse.json({ simulations: rows });
}
