import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBillingStatus, checkUsageLimit } from "@/lib/stripe/billing-gate";
import { getPlanLimits } from "@/lib/stripe/client";

export async function GET() {
  const { orgId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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
  } catch (err) {
    console.error("[Stripe Status] DB error, returning free-tier fallback:", err);
    const limits = getPlanLimits("starter");
    return NextResponse.json({
      hasSubscription: false,
      plan: "starter",
      status: "none",
      isActive: false,
      isTrial: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
      usage: {
        sms: { allowed: true, current: 0, limit: limits.sms, resource: "sms" },
        voiceMinutes: { allowed: true, current: 0, limit: limits.voiceMinutes, resource: "voiceMinutes" },
        agents: { allowed: true, current: 0, limit: limits.agents, resource: "agents" },
      },
      limits,
    });
  }
}
