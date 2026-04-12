const CALLS = [
  {
    id: 1,
    time: "8:42 AM",
    caller: "+1 (415) 555-0211",
    name: "Alex Morgan",
    duration: "2:18",
    outcome: "Qualified",
  },
  {
    id: 2,
    time: "9:15 AM",
    caller: "+1 (415) 555-0223",
    name: "Rachel Kim",
    duration: "0:48",
    outcome: "No-show",
  },
  {
    id: 3,
    time: "9:52 AM",
    caller: "+1 (415) 555-0245",
    name: "Jordan Lee",
    duration: "4:32",
    outcome: "Booked",
  },
  {
    id: 4,
    time: "10:28 AM",
    caller: "+1 (415) 555-0267",
    name: "Casey Park",
    duration: "1:56",
    outcome: "Qualified",
  },
  {
    id: 5,
    time: "11:03 AM",
    caller: "+1 (415) 555-0289",
    name: "Devon Hart",
    duration: "3:14",
    outcome: "Booked",
  },
];

export default function OutboundPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Outbound</div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Outbound calls
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Every lead Chatty reached out to today.
        </p>
      </div>

      <CallsTable calls={CALLS} />
    </div>
  );
}

function CallsTable({ calls }) {
  return (
    <div className="dark-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "var(--dark-surface-2)",
              borderBottom: "1px solid var(--dark-border)",
            }}
          >
            <Th>Time</Th>
            <Th>Caller</Th>
            <Th>Duration</Th>
            <Th>Outcome</Th>
            <Th>Recording</Th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c) => (
            <tr
              key={c.id}
              style={{ borderBottom: "1px solid var(--dark-border)" }}
            >
              <Td>{c.time}</Td>
              <Td>
                <div style={{ fontWeight: 600, color: "var(--text-bright)" }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {c.caller}
                </div>
              </Td>
              <Td>{c.duration}</Td>
              <Td>
                <OutcomePill outcome={c.outcome} />
              </Td>
              <Td>
                <span
                  style={{
                    color: "var(--emerald-bright)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  ▶ Play
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "14px 20px",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: "16px 20px",
        fontSize: 14,
        color: "var(--text-bright)",
      }}
    >
      {children}
    </td>
  );
}

function OutcomePill({ outcome }) {
  const styles = {
    Booked: {
      background: "var(--emerald-tint)",
      color: "var(--emerald-bright)",
      border: "1px solid rgba(16,185,129,0.3)",
    },
    Qualified: {
      background: "var(--emerald-tint)",
      color: "var(--emerald-bright)",
      border: "1px solid rgba(16,185,129,0.3)",
    },
    "No-show": {
      background: "var(--negative-soft)",
      color: "var(--negative)",
      border: "1px solid rgba(239,68,68,0.3)",
    },
  };
  const s = styles[outcome] || styles["No-show"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        ...s,
      }}
    >
      {outcome}
    </span>
  );
}
