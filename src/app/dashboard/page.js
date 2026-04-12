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
import { AnimatedGroup } from "@/components/ui/AnimatedGroup";

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
      {/* Header */}
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
          Dashboard
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 40,
            fontWeight: 600,
            margin: "6px 0 4px",
            letterSpacing: "-0.02em",
            color: "var(--text-bright)",
          }}
        >
          Good morning, Harbor Dental.
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Here&apos;s how Chatty is performing today.
        </div>
      </div>

      {/* KPI Grid */}
      <AnimatedGroup preset="blur-slide" style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        <DarkKpi label="Inbound Today" value="14" delta="↑ 22% vs yesterday" />
        <DarkKpi
          label="Outbound Today"
          value="6"
          delta="↑ 3 calls vs yesterday"
        />
        <DarkKpi label="Appointments" value="9" delta="↑ 4 vs yesterday" />
        <DarkKpi
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
                background: "var(--emerald-bright)",
                color: "#06140e",
                border: "none",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                lineHeight: 1,
                boxShadow: "0 0 16px rgba(52,211,153,0.3)",
              }}
              aria-label="Increment closed deals"
            >
              +
            </button>
          }
        />
      </AnimatedGroup>

      {/* Agent Quality KPIs */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 12,
        }}
      >
        Agent Quality
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginBottom: 28,
        }}
      >
        <DarkKpi
          label="Answer Rate"
          value="99.4%"
          delta="↑ near-perfect pickup"
          deltaColor="var(--emerald-bright)"
          sub="163 of 164 calls answered"
        />
        <DarkKpi
          label="Avg Time to Answer"
          value="0.8s"
          delta="↑ faster than human"
          deltaColor="var(--emerald-bright)"
          sub="Instant pickup, every time"
        />
        <DarkKpi
          label="Qualification Rate"
          value="62%"
          delta="↑ 4% vs last week"
          deltaColor="#c9a961"
          sub="Of all inbound leads"
        />
        <DarkKpi
          label="Booking Rate"
          value="41%"
          delta="↑ 7% vs last week"
          deltaColor="#c9a961"
          sub="Qualified → booked"
        />
      </div>

      {/* Chart */}
      <div className="glow-card" style={{ padding: 26 }}>
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
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "var(--text-bright)",
              }}
            >
              Calls this week
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              Last 7 days · inbound vs outbound
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <Legend color="var(--emerald-bright)" label="Inbound" />
            <Legend color="#c9a961" label="Outbound" />
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
                  color: "var(--text-muted)",
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
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#a8b3ad" }}
                  axisLine={{ stroke: "var(--dark-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a8b3ad" }}
                  axisLine={{ stroke: "var(--dark-border)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--dark-surface)",
                    border: "1px solid var(--dark-border)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "#f5f7f5",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inbound"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#34d399" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke="#c9a961"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#c9a961" }}
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
        <div className="dark-card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--text-bright)",
              marginBottom: 4,
            }}
          >
            Next appointment
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            Booked by Chatty · 12 minutes ago
          </div>
          <div
            style={{
              padding: 14,
              background: "rgba(52,211,153,0.04)",
              border: "1px solid var(--dark-border)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--text-bright)" }}>
              Mike Reynolds
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 2,
              }}
            >
              Today · 2:30 PM · Cleaning consultation
            </div>
          </div>
        </div>

        <div className="dark-card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--text-bright)",
              marginBottom: 4,
            }}
          >
            Agent status
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
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

function DarkKpi({ label, value, delta, action, deltaColor, sub }) {
  return (
    <div className="dark-card" style={{ padding: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {label}
        </div>
        {action || null}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 36,
          fontWeight: 700,
          color: "var(--text-bright)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {delta ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: deltaColor || "#c9a961",
          }}
        >
          {delta}
        </div>
      ) : null}
      {sub ? (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          {sub}
        </div>
      ) : null}
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
        color: "var(--text-muted)",
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
        color: "var(--text-bright)",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          padding: "3px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          background: ok
            ? "rgba(52,211,153,0.12)"
            : "rgba(248,113,113,0.12)",
          color: ok ? "var(--emerald-bright)" : "#f87171",
          border: ok
            ? "1px solid rgba(52,211,153,0.3)"
            : "1px solid rgba(248,113,113,0.3)",
        }}
      >
        {ok ? "● ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}
