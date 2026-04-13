import { NextResponse } from "next/server";
import Stripe from "stripe";

let stripeClient: InstanceType<typeof Stripe> | null = null;
function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session: any = event.data.object;
        console.log(`[Stripe] Checkout completed for customer: ${session.customer}`);
        // TODO: Activate subscription in database, update org status
        break;
      }

      case "invoice.paid": {
        const invoice: any = event.data.object;
        console.log(`[Stripe] Invoice paid: ${invoice.id}`);
        // TODO: Record successful payment, extend subscription
        break;
      }

      case "invoice.payment_failed": {
        const invoice: any = event.data.object;
        console.log(`[Stripe] Payment failed: ${invoice.id}`);
        // TODO: Notify org owner, mark subscription at risk
        break;
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object;
        console.log(`[Stripe] Subscription updated: ${subscription.id}, status: ${subscription.status}`);
        // TODO: Update subscription tier in database
        break;
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object;
        console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
        // TODO: Deactivate org, stop workflows
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
