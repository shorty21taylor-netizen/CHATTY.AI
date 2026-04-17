import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe/client";
import { db } from "@/lib/db/drizzle";
import { stripeCustomers } from "@/db/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { orgId, userId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { plan: string; billing_cycle?: "monthly" | "annual" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan || "starter";
  const cycle = body.billing_cycle || "monthly";

  const prices = STRIPE_PRICES[plan];
  if (!prices) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = cycle === "annual" ? prices.annual : prices.monthly;
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${plan}/${cycle}. Set STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()} env var.` },
      { status: 400 },
    );
  }

  const stripe = getStripe();

  const [existing] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.orgId, orgId))
    .limit(1);

  let customerId = existing?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { orgId, userId: userId || "" },
    });
    customerId = customer.id;

    await db.insert(stripeCustomers).values({
      orgId,
      stripeCustomerId: customerId,
      currentPlan: plan,
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/checkout?canceled=true`,
    metadata: { orgId, plan },
  });

  return NextResponse.json({ url: session.url });
}
