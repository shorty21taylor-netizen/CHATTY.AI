import Stripe from "stripe";

let stripe: InstanceType<typeof Stripe> | null = null;

export function getStripe(): InstanceType<typeof Stripe> {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key);
  }
  return stripe;
}

export interface PlanLimits {
  sms: number;
  voiceMinutes: number;
  agents: number;
  teamSeats: number;
  voiceLab: boolean;
  priorityEngine: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    sms: 2000,
    voiceMinutes: 200,
    agents: 3,
    teamSeats: 1,
    voiceLab: false,
    priorityEngine: false,
  },
  pro: {
    sms: 5000,
    voiceMinutes: 500,
    agents: 11,
    teamSeats: 5,
    voiceLab: false,
    priorityEngine: false,
  },
  scale: {
    sms: 20000,
    voiceMinutes: 2000,
    agents: 11,
    teamSeats: -1,
    voiceLab: true,
    priorityEngine: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
}

export const STRIPE_PRICES: Record<string, { monthly: string; annual: string }> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || "",
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  },
};
