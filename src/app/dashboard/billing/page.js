export default function BillingPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Billing</div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Plan &amp; billing
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Your current plan and invoices.
        </p>
      </div>

      <div
        className="dark-card"
        style={{ padding: 30, marginBottom: 22 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="t-eyebrow">
              Current plan
            </div>
            <div className="t-h1" style={{ marginTop: 6 }}>
              Inbound &middot; $97/mo
            </div>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                marginTop: 6,
              }}
            >
              Next invoice on April 28, 2026
            </div>
          </div>
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              background: "rgba(52,211,153,0.12)",
              color: "var(--emerald-bright)",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            ● ACTIVE
          </span>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--dark-border)",
            margin: "22px 0 18px",
          }}
        />

        <button className="cta-primary" style={{ cursor: "pointer" }}>
          Upgrade to Inbound + Outbound
        </button>
      </div>

      <div className="dark-card" style={{ padding: 30 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 6,
            color: "var(--text-bright)",
          }}
        >
          Invoices
        </div>
        <p
          style={{
            color: "var(--text-muted)",
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
