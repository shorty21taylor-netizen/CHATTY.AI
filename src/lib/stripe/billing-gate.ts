import { db } from "@/lib/db/drizzle";
import { stripeCustomers, billingUsage } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlanLimits } from "./client";

export interface BillingStatus {
  hasSubscription: boolean;
  plan: string;
  status: string;
  isActive: boolean;
  isTrial: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

export async function getBillingStatus(orgId: string): Promise<BillingStatus> {
  const [customer] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.orgId, orgId))
    .limit(1);

  if (!customer) {
    return {
      hasSubscription: false,
      plan: "starter",
      status: "none",
      isActive: false,
      isTrial: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null,
    };
  }

  const status = customer.stripeSubscriptionStatus || "incomplete";
  const isActive = ["active", "trialing"].includes(status);
  const isTrial = status === "trialing";

  return {
    hasSubscription: true,
    plan: customer.currentPlan,
    status,
    isActive,
    isTrial,
    cancelAtPeriodEnd: customer.cancelAtPeriodEnd,
    currentPeriodEnd: customer.currentPeriodEnd,
  };
}

export interface UsageCheck {
  allowed: boolean;
  current: number;
  limit: number;
  resource: string;
}

export async function checkUsageLimit(
  orgId: string,
  resource: "sms" | "voiceMinutes" | "agents",
): Promise<UsageCheck> {
  const billing = await getBillingStatus(orgId);
  const limits = getPlanLimits(billing.plan);

  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [usage] = await db
    .select()
    .from(billingUsage)
    .where(
      and(
        eq(billingUsage.orgId, orgId),
        eq(billingUsage.periodStart, periodStart),
      ),
    )
    .limit(1);

  const limitVal = limits[resource === "voiceMinutes" ? "voiceMinutes" : resource];
  let current = 0;
  if (usage) {
    switch (resource) {
      case "sms":
        current = usage.smsSent;
        break;
      case "voiceMinutes":
        current = usage.voiceMinutes;
        break;
      case "agents":
        current = usage.agentsActive;
        break;
    }
  }

  return {
    allowed: limitVal === -1 || current < limitVal,
    current,
    limit: limitVal,
    resource,
  };
}

export async function incrementUsage(
  orgId: string,
  resource: "sms" | "voiceMinutes" | "agents",
  amount: number = 1,
): Promise<void> {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const field =
    resource === "sms"
      ? "sms_sent"
      : resource === "voiceMinutes"
        ? "voice_minutes"
        : "agents_active";

  const { query: rawQuery } = await import("@/lib/db");
  await rawQuery(
    `INSERT INTO billing_usage (org_id, period_start, period_end, ${field})
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (org_id, period_start)
     DO UPDATE SET ${field} = billing_usage.${field} + $4, updated_at = now()`,
    [orgId, periodStart, periodEnd, amount],
  );
}
