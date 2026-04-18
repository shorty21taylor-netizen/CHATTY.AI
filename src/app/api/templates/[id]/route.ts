import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { industryPromptTemplates } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [template] = await db
    .select()
    .from(industryPromptTemplates)
    .where(
      and(
        eq(industryPromptTemplates.id, id),
        or(
          eq(industryPromptTemplates.orgId, orgId),
          eq(industryPromptTemplates.isSystem, true),
        ),
      ),
    )
    .limit(1);

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}
