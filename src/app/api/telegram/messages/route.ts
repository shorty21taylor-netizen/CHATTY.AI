import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { telegramSessions, telegramMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await db
    .select()
    .from(telegramSessions)
    .where(eq(telegramSessions.orgId, orgId))
    .orderBy(desc(telegramSessions.lastActiveAt));

  const messages = await db
    .select()
    .from(telegramMessages)
    .where(eq(telegramMessages.orgId, orgId))
    .orderBy(desc(telegramMessages.createdAt))
    .limit(20);

  return NextResponse.json({ sessions, messages });
}
