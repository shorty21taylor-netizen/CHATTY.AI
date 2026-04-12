'use client';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ClientOnly from "@/components/ClientOnly";
import { Delta } from "@/components/ui/Delta";

const mock = {
  callsAnswered: 163,
  totalCalls: 164,
  avgDeal: 2400,
  closeRate: 0.12,
  planCost: 97,
  weeklyRecovered: [
    { week: "W1", value: 9400 },
    { week: "W2", value: 11200 },
    { week: "W3", value: 12600 },
    { week: "W4", value: 14000 },
  ],
  funnel: [
    { stage: "Inbound Calls", count: 164, pct: null },
    { stage: "Qualified", count: 102, pct: 62 },
    { stage: "Booked", count: 67, pct: 41 },
    { stage: "Showed", count: 54, pct: 81 },
    { stage: "Closed", count: 23, pct: 43 },
  ],
  hourly: [
    0, 0, 0, 0, 0, 1, 2, 5, 9, 12, 14, 11, 8, 10, 13, 15, 14, 12, 9, 7, 4,
    2, 1, 0,
  ],
  durationTrend: [
    { day: 1, dur: 2.3 },
    { day: 2, dur: 2.5 },
    { day: 3, dur: 2.1 },
    { day: 4, dur: 2.8 },
    { day: 5, dur: 3.0 },
    { day: 6, dur: 2.4 },
    { day: 7, dur: 2.9 },
    { day: 8, dur: 3.1 },
    { day: 9, dur: 2.6 },
    { day: 10, dur: 2.7 },
    { day: 11, dur: 3.2 },
    { day: 12, dur: 2.8 },
    { day: 13, dur: 2.9 },
    { day: 14, dur: 2.78 },
  ],
  totalRevenue: 55200,
  avgDealSize: 2400,
  revenuePerCall: 337,
};

const missedCost =
  mock.callsAnswered * mock.avgDeal * mock.closeRate;
const roi = Math.floor(missedCost / mock.planCost);
const maxHourly = Math.max(...mock.hourly);

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header + time-range tabs */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
        <div className="t-eyebrow" style={{ marginBottom: 16 }}>
          Analytics
        </div>
        <h1 className="t-h1" style={{ margin: "8px 0 6px" }}>
          Performance Insights
        </h1>
        <p className="t-body" style={{ color: "var(--text-muted)", margin: 0 }}>
          What Chatty is producing for your business.
        </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tab-pill active">Last 30 days</button>
          <button className="tab-pill">Last 7 days</button>
          <button className="tab-pill">Last 90 days</button>
        </div>
      </div>

      {/* Section A — Hero: Missed Opportunity Cost */}
      <div
        className="spotlight-card"
        style={{
          padding: 40,
          marginBottom: 28,
          minHeight: 260,
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 14 }}>
            Missed Opportunity Cost &middot; Last 30 Days
          </div>
          <div className="t-kpi-lg">
            ${missedCost.toLocaleString()}
          </div>
          <p className="t-body" style={{ color: "var(--text-muted)", marginTop: 12, marginBottom: 0 }}>
            What you&apos;d have lost without Chatty answering.
          </p>
          <div className="t-mono" style={{ marginTop: 16 }}>
            {mock.callsAnswered} calls answered &times; $
            {mock.avgDeal.toLocaleString()} avg deal &times; {Math.round(mock.closeRate * 100)}%
            close rate
          </div>
          <div className="t-body" style={{ marginTop: 12, fontWeight: 600, color: "var(--emerald-bright)" }}>
            That&apos;s a {roi}x ROI on your ${mock.planCost}/mo plan.
          </div>
        </div>

        {/* Mini bar chart */}
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 14 }}>
            Missed cost recovered, by week
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ClientOnly
              fallback={
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mock.weeklyRecovered}
                  margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                >
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => ["$" + v.toLocaleString(), "Recovered"]}
                    contentStyle={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "var(--text-bright)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--emerald-bright)"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      {/* Section B — Funnel */}
      <div className="dark-card" style={{ padding: 28, marginBottom: 22 }}>
        <div className="t-h2" style={{ marginBottom: 6 }}>
          Lead &rarr; Revenue Funnel
        </div>
        <div className="t-body-sm" style={{ marginBottom: 24 }}>
          30-day conversion breakdown
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {mock.funnel.map((s, i) => {
            const widthPct =
              (s.count / mock.funnel[0].count) * 100;
            return (
              <div
                key={s.stage}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 120,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-bright)",
                    flexShrink: 0,
                  }}
                >
                  {s.stage}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--surface-2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: widthPct + "%",
                      height: "100%",
                      borderRadius: 8,
                      background: `rgba(16,185,129,${0.9 - i * 0.15})`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ffffff",
                      transition: "width .5s ease",
                    }}
                  >
                    {s.count}
                  </div>
                </div>
                <div
                  style={{
                    width: 80,
                    textAlign: "right",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {s.pct !== null ? s.pct + "%" : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C — Two-column: Heatmap + Duration */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
          marginBottom: 22,
        }}
      >
        {/* Calls by Hour heatmap */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="t-h2" style={{ marginBottom: 4 }}>
            Calls by Hour
          </div>
          <div className="t-body-sm" style={{ marginBottom: 20 }}>
            When your leads actually call (most are after-hours)
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 4,
            }}
          >
            {mock.hourly.map((count, h) => {
              const intensity =
                maxHourly > 0 ? count / maxHourly : 0;
              return (
                <div
                  key={h}
                  title={`${h}:00 — ${count} calls`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 6,
                    background:
                      intensity === 0
                        ? "var(--surface-2)"
                        : `rgba(16,185,129,${0.08 + intensity * 0.82})`,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    color:
                      intensity > 0.5
                        ? "#ffffff"
                        : "var(--text-muted)",
                    cursor: "default",
                  }}
                >
                  {h}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Avg Call Duration */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="t-h2" style={{ marginBottom: 4 }}>
            Avg Call Duration
          </div>
          <div className="t-body-sm" style={{ marginBottom: 14 }}>
            Quality signal &mdash; longer = more qualified
          </div>
          <div className="t-kpi" style={{ marginBottom: 18 }}>
            2m 47s
          </div>

          <div style={{ width: "100%", height: 120 }}>
            <ClientOnly
              fallback={
                <div
                  style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mock.durationTrend}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [v + " min", "Duration"]}
                    contentStyle={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "var(--text-bright)",
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="emeraldFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="dur"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#emeraldFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </div>
      </div>

      {/* Section D — Revenue Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
        }}
      >
        <RevCard
          label="Total Revenue Generated"
          value={"$" + mock.totalRevenue.toLocaleString()}
          deltaNode={<Delta value={18} suffix="% vs last month" positive />}
        />
        <RevCard
          label="Avg Deal Size"
          value={"$" + mock.avgDealSize.toLocaleString()}
          deltaNode={<Delta value="$200 vs last month" positive />}
        />
        <RevCard
          label="Revenue per Call"
          value={"$" + mock.revenuePerCall}
          deltaNode={<Delta value={12} suffix="% vs last month" positive />}
        />
      </div>
    </div>
  );
}

function RevCard({ label, value, deltaNode }) {
  return (
    <div className="dark-card" style={{ padding: 24 }}>
      <div className="t-eyebrow" style={{ marginBottom: 10 }}>
        {label}
      </div>
      <div className="t-kpi" style={{ color: "var(--emerald-bright)" }}>
        {value}
      </div>
      {deltaNode ? (
        <div style={{ marginTop: 8 }}>
          {deltaNode}
        </div>
      ) : null}
    </div>
  );
}
