'use client';

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import MacWindow from "@/components/MacWindow";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "inbound";

  const isBoth = plan === "both";
  const name = isBoth ? "Inbound + Outbound" : "Inbound";
  const price = isBoth ? 157 : 97;
  const features = isBoth
    ? [
        "Unlimited inbound calls",
        "Outbound dialer & lead lists",
        "Lead qualification",
        "Calendar booking",
        "Telegram EA included",
        "Priority support",
      ]
    : [
        "Unlimited inbound calls",
        "Lead qualification",
        "Calendar booking",
        "Call recordings & transcripts",
        "Telegram EA included",
      ];

  const handleContinue = () => {
    console.log("[stub] Continue to Stripe — plan:", plan, "price:", price);
    alert("Stripe integration comes in the next prompt. (Stub)");
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
          ← Back to home
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
                {name}
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
              <span
                style={{ fontSize: 20, color: "var(--ink-soft)" }}
              >
                $
              </span>
              {price}
              <span
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                {" "}
                / mo
              </span>
            </div>
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
            {features.map((f) => (
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
                  ✓
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
            <span>Monthly</span>
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
            <span>${price}.00</span>
          </div>

          <button
            onClick={handleContinue}
            className="mac-btn"
            style={{
              width: "100%",
              marginTop: 22,
              border: "none",
              fontSize: 15,
            }}
          >
            Continue to Stripe →
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-soft)",
              marginTop: 14,
            }}
          >
            Secure checkout · Cancel anytime · No setup fee
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
          Already paid?{" "}
          <Link
            href="/onboarding"
            style={{ color: "var(--green)", fontWeight: 600 }}
          >
            Skip to onboarding →
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
        <div style={{ padding: 60, textAlign: "center" }}>Loading…</div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
