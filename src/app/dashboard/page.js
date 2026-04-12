'use client';

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
import { Delta } from "@/components/ui/Delta";
import { RevenueFunnel } from "@/components/RevenueFunnel";

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
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Dashboard</div>
        <h1 className="t-display" style={{ margin: "8px 0 6px" }}>
          Good morning, Harbor Dental.
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          Here&apos;s how your funnel is performing today.
        </p>
      </div>

      {/* Revenue Funnel Hero */}
      <AnimatedGroup preset="blur-slide">
        <RevenueFunnel />
      </AnimatedGroup>

      {/* Agent Quality KPIs */}
      <div className="t-eyebrow" style={{ marginBottom: 12, marginTop: 8 }}>
        Agent quality
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
          deltaNode={<Delta value="near-perfect pickup" positive />}
          sub="163 of 164 calls answered"
        />
        <DarkKpi
          label="Avg Time to Answer"
          value="0.8s"
          deltaNode={<Delta value="faster than human" positive />}
          sub="Instant pickup, every time"
        />
        <DarkKpi
          label="Qualification Rate"
          value="62%"
          deltaNode={<Delta value={4} suffix="% vs last week" positive />}
          sub="Of all inbound leads"
        />
        <DarkKpi
          label="Booking Rate"
          value="41%"
          deltaNode={<Delta value={7} suffix="% vs last week" positive />}
          sub="Qualified to booked"
        />
      </div>

      {/* Chart */}
      <div className="dark-card" style={{ padding: 26 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <div className="t-h2">
              Calls this week
            </div>
            <div className="t-body-sm" style={{ marginTop: 2 }}>
              Last 7 days &middot; inbound vs outbound
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <Legend color="var(--emerald-bright)" label="Inbound" />
            <Legend color="var(--text-muted)" label="Outbound" dashed />
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
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--text-bright)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inbound"
                  stroke="var(--emerald-bright)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--emerald-bright)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="outbound"
                  stroke="var(--text-muted)"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: "var(--text-muted)" }}
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
          <div className="t-h2" style={{ marginBottom: 4 }}>
            Next appointment
          </div>
          <div className="t-body-sm" style={{ marginBottom: 14 }}>
            Booked by Chatty &middot; 12 minutes ago
          </div>
          <div
            style={{
              padding: 14,
              background: "var(--emerald-tint)",
              border: "1px solid var(--border)",
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
              Today &middot; 2:30 PM &middot; Cleaning consultation
            </div>
          </div>
        </div>

        <div className="dark-card" style={{ padding: 24 }}>
          <div className="t-h2" style={{ marginBottom: 4 }}>
            Agent status
          </div>
          <div className="t-body-sm" style={{ marginBottom: 14 }}>
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

function DarkKpi({ label, value, deltaNode, action, sub }) {
  return (
    <div className="dark-card" style={{ padding: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div className="t-eyebrow">
          {label}
        </div>
        {action || null}
      </div>
      <div className="t-kpi" style={{ marginTop: 12 }}>
        {value}
      </div>
      {deltaNode ? (
        <div style={{ marginTop: 8 }}>
          {deltaNode}
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

function Legend({ color, label, dashed }) {
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
      {dashed ? (
        <span
          style={{
            width: 14,
            height: 0,
            borderTop: `2px dashed ${color}`,
            display: "inline-block",
          }}
        />
      ) : (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
      )}
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
          background: ok ? "var(--emerald-tint)" : "var(--negative-soft)",
          color: ok ? "var(--emerald-bright)" : "var(--negative)",
          border: ok
            ? "1px solid rgba(16,185,129,0.3)"
            : "1px solid rgba(239,68,68,0.3)",
        }}
      >
        {ok ? "\u25CF ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}
