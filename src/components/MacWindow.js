export default function MacWindow({ title, children, className = "" }) {
  return (
    <div className={`mac-card overflow-hidden ${className}`}>
      <div className="mac-traffic">
        <span className="dot-red" />
        <span className="dot-yellow" />
        <span className="dot-green" />
        {title ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink-soft)",
              marginRight: 48,
            }}
          >
            {title}
          </div>
        ) : null}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
