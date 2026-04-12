'use client';

import { useState } from "react";

const INITIAL = [
  {
    id: 1,
    name: "Mike Reynolds",
    date: "Today, 2:30 PM",
    type: "Cleaning consultation",
    source: "Inbound",
    closed: false,
  },
  {
    id: 2,
    name: "Sarah Chen",
    date: "Today, 3:45 PM",
    type: "New patient exam",
    source: "Inbound",
    closed: false,
  },
  {
    id: 3,
    name: "Jordan Lee",
    date: "Tomorrow, 9:00 AM",
    type: "Crown fitting",
    source: "Outbound",
    closed: true,
  },
  {
    id: 4,
    name: "Priya Nair",
    date: "Tomorrow, 11:15 AM",
    type: "Cleaning consultation",
    source: "Inbound",
    closed: false,
  },
  {
    id: 5,
    name: "Devon Hart",
    date: "Wed, 2:00 PM",
    type: "Follow-up",
    source: "Outbound",
    closed: false,
  },
];

export default function AppointmentsPage() {
  const [rows, setRows] = useState(INITIAL);

  const toggle = (id) =>
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, closed: !row.closed } : row))
    );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Appointments
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 36,
            fontWeight: 600,
            margin: "6px 0 4px",
            letterSpacing: "-0.02em",
            color: "var(--text-bright)",
          }}
        >
          Booked appointments
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Everything Chatty put on your calendar. Mark closed to track revenue.
        </div>
      </div>

      <div
        className="dark-card"
        style={{ padding: 8, display: "flex", flexDirection: "column" }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 140px 160px",
              alignItems: "center",
              padding: "18px 20px",
              borderBottom: "1px solid var(--dark-border)",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--text-bright)",
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {row.type}
              </div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
              {row.date}
            </div>
            <div>
              <SourcePill source={row.source} />
            </div>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => toggle(row.id)}
                style={{
                  fontSize: 13,
                  padding: "8px 16px",
                  cursor: "pointer",
                  borderRadius: 10,
                  fontWeight: 600,
                  transition: "all .2s",
                  background: row.closed
                    ? "var(--emerald-bright)"
                    : "transparent",
                  color: row.closed ? "#06140e" : "var(--text-bright)",
                  border: row.closed
                    ? "1px solid var(--emerald-bright)"
                    : "1px solid var(--dark-border)",
                  boxShadow: row.closed
                    ? "0 0 16px rgba(52,211,153,0.3)"
                    : "none",
                }}
              >
                {row.closed ? "✓ Closed" : "Mark Closed"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourcePill({ source }) {
  const isInbound = source === "Inbound";
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
        background: isInbound
          ? "rgba(52,211,153,0.12)"
          : "rgba(201,169,97,0.12)",
        color: isInbound ? "var(--emerald-bright)" : "#c9a961",
        border: isInbound
          ? "1px solid rgba(52,211,153,0.3)"
          : "1px solid rgba(201,169,97,0.3)",
      }}
    >
      {source}
    </span>
  );
}
