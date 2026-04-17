import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { db } from "@/lib/db/drizzle";
import { stripeCustomers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Stripe Webhook] Signature verification failed:", msg);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Record<string, unknown>;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = (session.metadata as Record<string, string>)?.plan || "starter";

        console.log(`[Stripe] Checkout completed for customer: ${customerId}`);

        await db
          .update(stripeCustomers)
          .set({
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: "active",
            currentPlan: plan,
            updatedAt: new Date(),
          })
          .where(eq(stripeCustomers.stripeCustomerId, customerId));
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Record<string, unknown>;
        const customerId = invoice.customer as string;
        console.log(`[Stripe] Invoice paid: ${invoice.id}`);

        await db
          .update(stripeCustomers)
          .set({
            stripeSubscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(stripeCustomers.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Record<string, unknown>;
        const customerId = invoice.customer as string;
        console.log(`[Stripe] Payment failed: ${invoice.id}`);

        await db
          .update(stripeCustomers)
          .set({
            stripeSubscriptionStatus: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(stripeCustomers.stripeCustomerId, customerId));
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Record<string, unknown>;
        const customerId = sub.customer as string;
        const status = sub.status as string;
        const cancelAtEnd = sub.cancel_at_period_end as boolean;
        const periodEnd = sub.current_period_end as number;

        console.log(`[Stripe] Subscription updated: ${sub.id}, status: ${status}`);

        await db
          .update(stripeCustomers)
          .set({
            stripeSubscriptionStatus: status,
            cancelAtPeriodEnd: cancelAtEnd || false,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            updatedAt: new Date(),
          })
          .where(eq(stripeCustomers.stripeCustomerId, customerId));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Record<string, unknown>;
        const customerId = sub.customer as string;
        console.log(`[Stripe] Subscription canceled: ${sub.id}`);

        await db
          .update(stripeCustomers)
          .set({
            stripeSubscriptionStatus: "canceled",
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(stripeCustomers.stripeCustomerId, customerId));
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
