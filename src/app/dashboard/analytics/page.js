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
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Analytics
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
          Performance Insights
        </h1>
        <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
          What Chatty is producing for your business.
        </div>
      </div>

      {/* Section A — Hero: Missed Opportunity Cost */}
      <div
        className="dark-card glow-border"
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
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            Missed Opportunity Cost · Last 30 Days
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 88,
              fontWeight: 700,
              color: "var(--text-bright)",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(52,211,153,0.25)",
              letterSpacing: "-0.03em",
            }}
          >
            ${missedCost.toLocaleString()}
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 16,
              marginTop: 12,
            }}
          >
            What you&apos;d have lost without Chatty answering.
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "monospace",
              letterSpacing: "0.01em",
            }}
          >
            {mock.callsAnswered} calls answered × $
            {mock.avgDeal.toLocaleString()} avg deal × {Math.round(mock.closeRate * 100)}%
            close rate
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--emerald-bright)",
            }}
          >
            That&apos;s a {roi}x ROI on your ${mock.planCost}/mo plan.
          </div>
        </div>

        {/* Mini bar chart */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
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
                    tick={{ fontSize: 11, fill: "#a8b3ad" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => ["$" + v.toLocaleString(), "Recovered"]}
                    contentStyle={{
                      background: "var(--dark-surface)",
                      border: "1px solid var(--dark-border)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#f5f7f5",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#34d399"
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
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-bright)",
            marginBottom: 6,
          }}
        >
          Lead → Revenue Funnel
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 24,
          }}
        >
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
                    background: "rgba(255,255,255,0.02)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: widthPct + "%",
                      height: "100%",
                      borderRadius: 8,
                      background: `rgba(52,211,153,${0.9 - i * 0.15})`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      color: i < 2 ? "#06140e" : "var(--text-bright)",
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
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-bright)",
              marginBottom: 4,
            }}
          >
            Calls by Hour
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 20,
            }}
          >
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
                        ? "rgba(52,211,153,0.03)"
                        : `rgba(52,211,153,${0.08 + intensity * 0.82})`,
                    border: "1px solid var(--dark-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 600,
                    color:
                      intensity > 0.5
                        ? "#06140e"
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
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-bright)",
              marginBottom: 4,
            }}
          >
            Avg Call Duration
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 14,
            }}
          >
            Quality signal — longer = more qualified
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "var(--text-bright)",
              lineHeight: 1,
              marginBottom: 18,
            }}
          >
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
                    tick={{ fontSize: 10, fill: "#a8b3ad" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [v + " min", "Duration"]}
                    contentStyle={{
                      background: "var(--dark-surface)",
                      border: "1px solid var(--dark-border)",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#f5f7f5",
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
                        stopColor="#34d399"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#34d399"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="dur"
                    stroke="#34d399"
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
          delta="↑ 18% vs last month"
        />
        <RevCard
          label="Avg Deal Size"
          value={"$" + mock.avgDealSize.toLocaleString()}
          delta="↑ $200 vs last month"
        />
        <RevCard
          label="Revenue per Call"
          value={"$" + mock.revenuePerCall}
          delta="↑ 12% vs last month"
        />
      </div>
    </div>
  );
}

function RevCard({ label, value, delta }) {
  return (
    <div className="dark-card" style={{ padding: 24 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "var(--emerald-bright)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "#c9a961",
        }}
      >
        {delta}
      </div>
    </div>
  );
}
