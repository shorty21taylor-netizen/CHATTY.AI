import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCallTask, recordOutcome } from "@/lib/call-tasks/registry";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const task = await getCallTask(orgId, id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ call: task });
  } catch (err) {
    console.error("[Call Detail] Error:", err);
    return NextResponse.json({ error: "Failed to load call" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const task = await getCallTask(orgId, id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { outcome, outcome_notes } = body as Record<string, string>;
  if (outcome) {
    await recordOutcome(id, outcome as any, undefined, outcome_notes);
  }

  const updated = await getCallTask(orgId, id);
  return NextResponse.json({ call: updated });
}
