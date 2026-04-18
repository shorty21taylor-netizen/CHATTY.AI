import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runPlaybook } from "@/lib/playbooks/registry";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await runPlaybook(orgId, id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[API] Playbook run error:", err);
    const message = err instanceof Error ? err.message : "Run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
