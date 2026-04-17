import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBillingStatus, checkUsageLimit } from "@/lib/stripe/billing-gate";
import { getPlanLimits } from "@/lib/stripe/client";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [status, sms, voice, agents] = await Promise.all([
    getBillingStatus(orgId),
    checkUsageLimit(orgId, "sms"),
    checkUsageLimit(orgId, "voiceMinutes"),
    checkUsageLimit(orgId, "agents"),
  ]);

  const limits = getPlanLimits(status.plan);

  return NextResponse.json({
    ...status,
    usage: { sms, voiceMinutes: voice, agents },
    limits,
  });
}
