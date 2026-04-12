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
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Appointments
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
          Booked appointments
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
          Everything Chatty put on your calendar. Mark closed to track revenue.
        </div>
      </div>

      <div
        className="mac-card"
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
              borderBottom: "1px solid var(--border)",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{row.name}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  marginTop: 2,
                }}
              >
                {row.type}
              </div>
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
              {row.date}
            </div>
            <div>
              <span
                className={
                  row.source === "Inbound" ? "pill pill-green" : "pill pill-gold"
                }
              >
                {row.source}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => toggle(row.id)}
                className={row.closed ? "mac-btn" : "mac-btn-outline"}
                style={{
                  fontSize: 13,
                  padding: "8px 16px",
                  cursor: "pointer",
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
