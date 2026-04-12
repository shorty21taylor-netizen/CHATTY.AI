'use client';

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "chatty_appointments";

const DEFAULT_ROWS = [
  {
    id: 1,
    name: "Mike Reynolds",
    date: "Today, 2:30 PM",
    type: "Cleaning consultation",
    source: "Inbound",
    status: "open",
    dealValue: 0,
    closedAt: null,
    showingValueInput: false,
  },
  {
    id: 2,
    name: "Sarah Chen",
    date: "Today, 3:45 PM",
    type: "New patient exam",
    source: "Inbound",
    status: "open",
    dealValue: 0,
    closedAt: null,
    showingValueInput: false,
  },
  {
    id: 3,
    name: "Jordan Lee",
    date: "Tomorrow, 9:00 AM",
    type: "Crown fitting",
    source: "Outbound",
    status: "closed",
    dealValue: 3200,
    closedAt: Date.now(),
    showingValueInput: false,
  },
  {
    id: 4,
    name: "Priya Nair",
    date: "Tomorrow, 11:15 AM",
    type: "Cleaning consultation",
    source: "Inbound",
    status: "open",
    dealValue: 0,
    closedAt: null,
    showingValueInput: false,
  },
  {
    id: 5,
    name: "Devon Hart",
    date: "Wed, 2:00 PM",
    type: "Follow-up",
    source: "Outbound",
    status: "open",
    dealValue: 0,
    closedAt: null,
    showingValueInput: false,
  },
];

function loadRows() {
  if (typeof window === "undefined") return DEFAULT_ROWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((r) => ({ ...r, showingValueInput: false }));
    }
  } catch {}
  return DEFAULT_ROWS;
}

function saveRows(rows) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      rows.map(({ showingValueInput, ...rest }) => rest)
    )
  );
}

export default function AppointmentsPage() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRows(loadRows());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveRows(rows);
  }, [rows, mounted]);

  function showValueInput(id) {
    setRows((r) =>
      r.map((row) =>
        row.id === id ? { ...row, showingValueInput: true } : row
      )
    );
  }

  function cancelValueInput(id) {
    setRows((r) =>
      r.map((row) =>
        row.id === id ? { ...row, showingValueInput: false } : row
      )
    );
  }

  function confirmClose(id, value) {
    setRows((r) =>
      r.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "closed",
              dealValue: Number(value) || 0,
              closedAt: Date.now(),
              showingValueInput: false,
            }
          : row
      )
    );
  }

  function markLost(id) {
    setRows((r) =>
      r.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "lost",
              dealValue: 0,
              closedAt: null,
              showingValueInput: false,
            }
          : row
      )
    );
  }

  function editDeal(id) {
    setRows((r) =>
      r.map((row) =>
        row.id === id ? { ...row, showingValueInput: true } : row
      )
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Appointments</div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Booked appointments
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Everything Chatty put on your calendar. Mark closed with deal value to
          track revenue.
        </p>
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
              gridTemplateColumns: "1fr 1fr 120px 1fr",
              alignItems: "center",
              padding: "18px 20px",
              borderBottom: "1px solid var(--border)",
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ActionCell
                row={row}
                onShowInput={() => showValueInput(row.id)}
                onCancel={() => cancelValueInput(row.id)}
                onConfirm={(val) => confirmClose(row.id, val)}
                onLost={() => markLost(row.id)}
                onEdit={() => editDeal(row.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCell({ row, onShowInput, onCancel, onConfirm, onLost, onEdit }) {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (row.showingValueInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [row.showingValueInput]);

  if (row.status === "lost") {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          background: "rgba(248,113,113,0.12)",
          color: "#f87171",
          border: "1px solid rgba(248,113,113,0.3)",
        }}
      >
        Lost
      </span>
    );
  }

  if (row.status === "closed" && !row.showingValueInput) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: "var(--emerald-tint)",
            color: "var(--emerald-bright)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          ✓ Closed · ${row.dealValue.toLocaleString()}
        </span>
        <button
          onClick={onEdit}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: 14,
            padding: 4,
          }}
          title="Edit deal value"
        >
          ✎
        </button>
      </div>
    );
  }

  if (row.showingValueInput) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0 10px",
          }}
        >
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              marginRight: 2,
            }}
          >
            $
          </span>
          <input
            ref={inputRef}
            type="number"
            placeholder="Deal value"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm(inputVal);
              if (e.key === "Escape") onCancel();
            }}
            style={{
              width: 100,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-bright)",
              fontSize: 14,
              padding: "8px 0",
            }}
          />
        </div>
        <button
          onClick={() => onConfirm(inputVal)}
          className="cta-primary"
          style={{ padding: "6px 14px", fontSize: 12 }}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="cta-ghost"
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // status === 'open', not showing input
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={onShowInput}
        className="cta-primary"
        style={{ padding: "6px 14px", fontSize: 12 }}
      >
        Mark Closed →
      </button>
      <button
        onClick={onLost}
        className="cta-ghost"
        style={{ padding: "6px 12px", fontSize: 12 }}
      >
        Lost
      </button>
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
        background: isInbound ? "var(--emerald-tint)" : "var(--surface-2)",
        color: isInbound ? "var(--emerald-bright)" : "var(--text-muted)",
        border: isInbound
          ? "1px solid rgba(16,185,129,0.3)"
          : "1px solid var(--border)",
      }}
    >
      {source}
    </span>
  );
}
