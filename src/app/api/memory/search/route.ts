import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { searchNodes } from "@/lib/memory-graph/nodes";
import { getOrgGraph } from "@/lib/memory-graph/graph";

export async function GET(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const graphMode = url.searchParams.get("graph") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);

  try {
    if (graphMode) {
      const graph = await getOrgGraph(orgId, limit);
      return NextResponse.json(graph);
    }

    if (!q) {
      return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
    }

    const results = await searchNodes(orgId, q, limit);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[API] Memory search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
