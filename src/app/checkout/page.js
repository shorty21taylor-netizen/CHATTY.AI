'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import MacWindow from "@/components/MacWindow";

const PLANS = {
  starter: {
    name: "Starter",
    monthly: 199,
    annual: 169,
    features: [
      "2,000 SMS / month",
      "200 voice minutes",
      "3 AI agents",
      "1 team seat",
      "Daily Brief SMS",
    ],
  },
  pro: {
    name: "Pro",
    monthly: 499,
    annual: 419,
    features: [
      "5,000 SMS / month",
      "500 voice minutes",
      "All 11 AI agents",
      "5 team seats",
      "Telegram EA included",
      "Priority support",
    ],
  },
};

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = searchParams.get("plan") || "starter";
  const canceled = searchParams.get("canceled") === "true";

  const plan = PLANS[planKey] || PLANS.starter;
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const price = cycle === "annual" ? plan.annual : plan.monthly;
  const savings = cycle === "annual" ? (plan.monthly - plan.annual) * 12 : 0;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing_cycle: cycle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create checkout session");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            fontWeight: 500,
          }}
        >
          &larr; Back to home
        </Link>

        <h1
          className="font-serif"
          style={{
            fontSize: 40,
            fontWeight: 600,
            marginTop: 20,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Checkout
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            marginBottom: 28,
            fontSize: 15,
          }}
        >
          Review your plan and continue to secure payment.
        </p>

        {canceled && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: 20,
              borderRadius: 8,
              background: "color-mix(in srgb, #f59e0b 12%, transparent)",
              border: "1px solid color-mix(in srgb, #f59e0b 30%, transparent)",
              color: "#f59e0b",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Checkout was canceled. You can try again whenever you&apos;re ready.
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: 20,
              borderRadius: 8,
              background: "color-mix(in srgb, #ef4444 12%, transparent)",
              border: "1px solid color-mix(in srgb, #ef4444 30%, transparent)",
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <MacWindow title="plan summary">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--ink-soft)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Chatty.AI Plan
              </div>
              <div
                className="font-serif"
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {plan.name}
              </div>
            </div>
            <div
              className="font-serif"
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ fontSize: 20, color: "var(--ink-soft)" }}>$</span>
              {price}
              <span
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                {" "}/ mo
              </span>
            </div>
          </div>

          {/* Billing cycle toggle */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
            }}
          >
            {["monthly", "annual"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  border: cycle === c
                    ? "1.5px solid var(--green)"
                    : "1px solid var(--ink-faint, #333)",
                  borderRadius: 8,
                  background: cycle === c
                    ? "color-mix(in srgb, var(--green) 10%, transparent)"
                    : "transparent",
                  color: cycle === c ? "var(--green)" : "var(--ink-soft)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {c}
                {c === "annual" && savings > 0 && (
                  <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>
                    Save ${savings}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="soft-divider" style={{ margin: "12px 0 18px" }} />

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 11,
            }}
          >
            {plan.features.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 14,
                  color: "var(--ink)",
                }}
              >
                <span className="gold-accent" style={{ fontWeight: 700 }}>
                  &#10003;
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="soft-divider" style={{ margin: "22px 0 18px" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "var(--ink-soft)",
              marginBottom: 6,
            }}
          >
            <span>Subtotal</span>
            <span>${price}.00</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: "var(--ink-soft)",
              marginBottom: 12,
            }}
          >
            <span>Billed</span>
            <span style={{ textTransform: "capitalize" }}>{cycle}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            <span>Total today</span>
            <span>${cycle === "annual" ? price * 12 : price}.00</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mac-btn"
            style={{
              width: "100%",
              marginTop: 22,
              border: "none",
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Redirecting..." : "Continue to Stripe \u2192"}
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-soft)",
              marginTop: 14,
            }}
          >
            Secure checkout &middot; Cancel anytime &middot; No setup fee
          </div>
        </MacWindow>

        <div
          style={{
            marginTop: 18,
            fontSize: 13,
            color: "var(--ink-soft)",
            textAlign: "center",
          }}
        >
          Already subscribed?{" "}
          <Link
            href="/dashboard/billing"
            style={{ color: "var(--green)", fontWeight: 600 }}
          >
            Go to billing &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 60, textAlign: "center" }}>Loading&hellip;</div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
