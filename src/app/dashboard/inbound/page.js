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
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Inbound
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
          Inbound calls
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
          Every call Chatty answered for you today.
        </div>
      </div>

      <CallsTable calls={CALLS} />
    </div>
  );
}

function CallsTable({ calls }) {
  return (
    <div className="mac-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
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
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <Td>{c.time}</Td>
              <Td>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
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
                    color: "var(--green)",
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
        fontSize: 12,
        fontWeight: 700,
        color: "var(--ink-soft)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: "16px 20px", fontSize: 14, color: "var(--ink)" }}>
      {children}
    </td>
  );
}

function OutcomePill({ outcome }) {
  const map = {
    Booked: "pill pill-green",
    Qualified: "pill pill-gold",
    "No-show": "pill",
  };
  return <span className={map[outcome] || "pill"}>{outcome}</span>;
}
