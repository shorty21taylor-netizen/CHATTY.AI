export default function KpiCard({ label, value, delta, suffix, action }) {
  return (
    <div className="mac-card" style={{ padding: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
        {action ? action : null}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 38,
          fontWeight: 700,
          color: "var(--ink)",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {value}
        {suffix ? (
          <span
            style={{ fontSize: 18, color: "var(--ink-soft)", marginLeft: 4 }}
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {delta ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--primary)",
          }}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}
