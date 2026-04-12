const CALLS = [
  {
    id: 1,
    time: "9:12 AM",
    caller: "+1 (415) 555-0132",
    name: "Mike Reynolds",
    duration: "3:42",
    outcome: "Booked",
  },
  {
    id: 2,
    time: "9:47 AM",
    caller: "+1 (415) 555-0188",
    name: "Sarah Chen",
    duration: "2:18",
    outcome: "Qualified",
  },
  {
    id: 3,
    time: "10:21 AM",
    caller: "+1 (415) 555-0144",
    name: "James Walker",
    duration: "1:05",
    outcome: "No-show",
  },
  {
    id: 4,
    time: "10:58 AM",
    caller: "+1 (415) 555-0156",
    name: "Priya Nair",
    duration: "4:12",
    outcome: "Booked",
  },
  {
    id: 5,
    time: "11:34 AM",
    caller: "+1 (415) 555-0198",
    name: "Tom Garcia",
    duration: "2:47",
    outcome: "Qualified",
  },
  {
    id: 6,
    time: "12:09 PM",
    caller: "+1 (415) 555-0121",
    name: "Emma Brooks",
    duration: "3:21",
    outcome: "Booked",
  },
];

export default function InboundPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Inbound</div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Inbound calls
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Every call Chatty answered for you today.
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
      background: "rgba(52,211,153,0.12)",
      color: "var(--emerald-bright)",
      border: "1px solid rgba(52,211,153,0.3)",
    },
    Qualified: {
      background: "rgba(52,211,153,0.12)",
      color: "var(--emerald-bright)",
      border: "1px solid rgba(52,211,153,0.3)",
    },
    "No-show": {
      background: "rgba(248,113,113,0.12)",
      color: "#f87171",
      border: "1px solid rgba(248,113,113,0.3)",
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
