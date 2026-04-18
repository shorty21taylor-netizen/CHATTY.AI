import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { listTemplates } from "@/lib/industry-prompts/registry";

export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const industry = req.nextUrl.searchParams.get("industry") || undefined;
  const useCase = req.nextUrl.searchParams.get("use_case") || undefined;

  try {
    let templates = await listTemplates(orgId, industry);
    if (useCase) {
      templates = templates.filter((t) => t.useCase === useCase);
    }
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[Templates API] Error:", err);
    return NextResponse.json({ templates: [] });
  }
}
