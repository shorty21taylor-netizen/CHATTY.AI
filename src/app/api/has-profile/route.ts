import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasProfile } from "@/lib/business-profile";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const exists = await hasProfile(orgId);
    return NextResponse.json({ hasProfile: exists });
  } catch {
    return NextResponse.json({ hasProfile: false });
  }
}
