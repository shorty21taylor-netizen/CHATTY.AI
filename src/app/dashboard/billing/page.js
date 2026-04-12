export default function BillingPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Billing
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: 36,
            fontWeight: 600,
            margin: "6px 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          Plan & billing
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
          Your current plan and invoices.
        </div>
      </div>

      <div className="mac-card" style={{ padding: 30, marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
              Current plan
            </div>
            <div
              className="font-serif"
              style={{ fontSize: 30, fontWeight: 600, marginTop: 4 }}
            >
              Inbound · $97/mo
            </div>
            <div
              style={{
                color: "var(--ink-soft)",
                fontSize: 14,
                marginTop: 6,
              }}
            >
              Next invoice on April 28, 2026
            </div>
          </div>
          <span className="pill pill-green">● ACTIVE</span>
        </div>

        <div className="soft-divider" style={{ margin: "22px 0 18px" }} />

        <button className="mac-btn" style={{ cursor: "pointer" }}>
          Upgrade to Inbound + Outbound
        </button>
      </div>

      <div className="mac-card" style={{ padding: 30 }}>
        <div
          className="font-serif"
          style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}
        >
          Invoices
        </div>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Stripe integration and invoice history ship in the next prompt.
        </p>
      </div>
    </div>
  );
}
