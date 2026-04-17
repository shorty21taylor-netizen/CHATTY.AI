import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBillingStatus } from "@/lib/stripe/billing-gate";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = await getBillingStatus(orgId);
  return NextResponse.json(status);
}
