'use client';

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ClientOnly from "@/components/ClientOnly";
import KpiCard from "@/components/KpiCard";

const CHART_DATA = [
  { day: "Mon", inbound: 8, outbound: 3 },
  { day: "Tue", inbound: 12, outbound: 5 },
  { day: "Wed", inbound: 9, outbound: 4 },
  { day: "Thu", inbound: 15, outbound: 7 },
  { day: "Fri", inbound: 18, outbound: 9 },
  { day: "Sat", inbound: 6, outbound: 2 },
  { day: "Sun", inbound: 11, outbound: 4 },
];

export default function OverviewPage() {
  const [closedDeals, setClosedDeals] = useState(7);

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
          Dashboard
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
          Good morning, Harbor Dental.
        </h1>
        <div style={{ color: "var(--ink-soft)", fontSize: 15 }}>
          Here's how Chatty is performing today.
        </div>
      </div>

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        <KpiCard
          label="Inbound Today"
          value="14"
          delta="↑ 22% vs yesterday"
        />
        <KpiCard
          label="Outbound Today"
          value="6"
          delta="↑ 3 calls vs yesterday"
        />
        <KpiCard
          label="Appointments"
          value="9"
          delta="↑ 4 vs yesterday"
        />
        <KpiCard
          label="Closed Deals"
          value={closedDeals}
          delta="This week"
          action={
            <button
              onClick={() => setClosedDeals((n) => n + 1)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--green)",
                color: "var(--gold)",
                border: "none",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Increment closed deals"
            >
              +
            </button>
          }
        />
      </div>

      {/* Chart */}
      <div className="mac-card" style={{ padding: 26 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              className="font-serif"
              style={{ fontSize: 22, fontWeight: 600 }}
            >
              Calls this week
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-soft)",
                marginTop: 2,
              }}
            >
              Last 7 days · inbound vs outbound
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <Legend color="var(--green)" label="Inbound" />
            <Legend color="var(--gold)" label="Outbound" />
          </div>
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <ClientOnly
            fallback={
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ink-soft)",
                  fontSize: 13,
                }}
              >
                Loading chart…
              </div>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={CHART_DATA}
                margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(26,58,46,0.08)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inbound"
                  stroke="var(--green)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--green)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke="var(--gold)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--gold)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          marginTop: 22,
        }}
      >
        <div className="mac-card" style={{ padding: 24 }}>
          <div
            className="font-serif"
            style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}
          >
            Next appointment
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              marginBottom: 14,
            }}
          >
            Booked by Chatty · 12 minutes ago
          </div>
          <div
            style={{
              padding: 14,
              background: "var(--surface-2)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontWeight: 600 }}>Mike Reynolds</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-soft)",
                marginTop: 2,
              }}
            >
              Today · 2:30 PM · Cleaning consultation
            </div>
          </div>
        </div>

        <div className="mac-card" style={{ padding: 24 }}>
          <div
            className="font-serif"
            style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}
          >
            Agent status
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              marginBottom: 14,
            }}
          >
            All systems operational
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14,
            }}
          >
            <StatusRow label="Inbound receptionist" ok />
            <StatusRow label="Outbound dialer" ok />
            <StatusRow label="Telegram EA" ok />
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "var(--ink-soft)",
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </div>
  );
}

function StatusRow({ label, ok }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{label}</span>
      <span
        className={ok ? "pill pill-green" : "pill"}
        style={{ fontSize: 11 }}
      >
        {ok ? "● ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}
