import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await inngest.send({
    name: "brief/run",
    data: { orgId },
  });

  return NextResponse.json({ status: "queued", orgId });
}
