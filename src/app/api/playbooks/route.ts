import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listPlaybooks } from "@/lib/playbooks/registry";

export async function GET(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const activeOnly = url.searchParams.get("active") !== "false";

  try {
    const playbooks = await listPlaybooks(orgId, activeOnly);
    return NextResponse.json({ playbooks });
  } catch (err) {
    console.error("[API] Playbooks list error:", err);
    return NextResponse.json({ error: "Failed to list playbooks" }, { status: 500 });
  }
}
