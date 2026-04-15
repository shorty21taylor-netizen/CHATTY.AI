'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DollarSign,
  Zap,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  MapPin,
  Rocket,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const REVENUE_BY_AGENT = [
  { agent: 'Instant Lead Response', value: 18400, color: 'var(--emerald-bright)' },
  { agent: 'Appointment Setter', value: 12200, color: '#3b82f6' },
  { agent: 'Quote Follow-Up', value: 6800, color: '#8b5cf6' },
  { agent: 'Ghosted Bid Follow-Up', value: 3200, color: '#f59e0b' },
  { agent: 'Dead Lead Reactivation', value: 2200, color: '#ec4899' },
];

const CONVERSION_FUNNEL = [
  { stage: 'Leads', value: 247, color: '#3b82f6' },
  { stage: 'Qualified', value: 148, color: '#8b5cf6' },
  { stage: 'Proposals', value: 34, color: '#f59e0b' },
  { stage: 'Won', value: 15, color: 'var(--emerald-bright)' },
];

const RESPONSE_TREND = Array.from({ length: 30 }).map((_, i) => ({
  day: i + 1,
  seconds: Math.max(18, Math.round(120 - i * 2.6 + Math.sin(i / 2.1) * 9)),
}));

const LEAD_SOURCE = [
  { name: 'Google Ads', value: 38, color: 'var(--emerald-bright)' },
  { name: 'Facebook', value: 27, color: '#3b82f6' },
  { name: 'Website Form', value: 18, color: '#8b5cf6' },
  { name: 'Referral', value: 11, color: '#f59e0b' },
  { name: 'Inbound Call', value: 6, color: '#ec4899' },
];

const LEADERBOARD = [
  { agent: 'Instant Lead Response', revenue: 18400, deals: 6, avg: 3067, response: '22s' },
  { agent: 'Appointment Setter', revenue: 12200, deals: 4, avg: 3050, response: '41s' },
  { agent: 'Quote Follow-Up', revenue: 6800, deals: 2, avg: 3400, response: '2m 14s' },
  { agent: 'Ghosted Bid Follow-Up', revenue: 3200, deals: 1, avg: 3200, response: '4m 02s' },
  { agent: 'Dead Lead Reactivation', revenue: 2200, deals: 1, avg: 2200, response: '6m 48s' },
  { agent: 'Objection Handler', revenue: 1400, deals: 1, avg: 1400, response: '32s' },
  { agent: 'Social DM Agent', revenue: 1100, deals: 0, avg: 0, response: '1m 08s' },
  { agent: 'Form Bot', revenue: 900, deals: 0, avg: 0, response: '18s' },
  { agent: 'Review Request', revenue: 700, deals: 0, avg: 0, response: '—' },
  { agent: 'Past Customer Re-engagement', revenue: 600, deals: 0, avg: 0, response: '3m 22s' },
];

const WEEKLY_TRENDS = [
  { icon: Calendar, label: 'Best Day', value: 'Tuesday', hint: '+38% vs avg' },
  { icon: Clock, label: 'Best Time', value: '2pm – 4pm', hint: '42 bookings' },
  { icon: MapPin, label: 'Top Source', value: 'Referral', hint: '68% close rate' },
  { icon: Rocket, label: 'Fastest Agent', value: 'Instant Lead', hint: '22s avg' },
];

function formatCurrency(n) {
  return `$${n.toLocaleString('en-US')}`;
}

function KpiHero({ icon, label, value, hint, accent }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: accent ? '0 0 24px rgba(16,185,129,0.12)' : 'none',
        borderColor: accent ? 'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))' : 'var(--border)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 6,
            background: accent
              ? 'color-mix(in srgb, var(--emerald-bright) 14%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
            color: accent ? 'var(--emerald-bright)' : 'var(--text-muted)',
          }}
        >
          {icon}
        </span>
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--emerald-bright)' : 'var(--text-bright)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="dark-card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <div style={{ height: 260 }}>{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="t-eyebrow">Analytics</div>
          <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
            Performance analytics
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Revenue, conversion, and agent performance across your AI sales team.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span className="t-body-sm">Range:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{ width: 'auto', paddingRight: 28 }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
      </div>

      {/* KPI heroes */}
      <div
        className="analytics-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
      >
        <KpiHero
          icon={<DollarSign size={13} />}
          label="Revenue Attributed to AI"
          value="$42,800"
          hint="+23% vs last period"
          accent
        />
        <KpiHero
          icon={<Target size={13} />}
          label="Deals Won"
          value="15"
          hint="34 proposals sent"
        />
        <KpiHero
          icon={<Zap size={13} />}
          label="Avg Response"
          value="47s"
          hint="Down from 2m 18s"
        />
        <KpiHero
          icon={<TrendingUp size={13} />}
          label="AI Booking Rate"
          value="58%"
          hint="Industry avg: 23%"
        />
      </div>

      {/* Chart grid 2x2 */}
      <div
        className="analytics-chart-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
      >
        <ChartCard
          title="Revenue by Agent"
          subtitle="Top contributors this period"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={REVENUE_BY_AGENT}
              margin={{ top: 6, right: 18, left: 10, bottom: 4 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <YAxis
                type="category"
                dataKey="agent"
                width={120}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
              />
              <Tooltip
                cursor={{ fill: 'color-mix(in srgb, var(--text-muted) 10%, transparent)' }}
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [formatCurrency(v), 'Revenue']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {REVENUE_BY_AGENT.map((row, i) => (
                  <Cell key={i} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          subtitle="Lead → Qualified → Proposal → Won"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={CONVERSION_FUNNEL}
              margin={{ top: 6, right: 18, left: 10, bottom: 4 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
              />
              <YAxis
                type="category"
                dataKey="stage"
                width={90}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
              />
              <Tooltip
                cursor={{ fill: 'color-mix(in srgb, var(--text-muted) 10%, transparent)' }}
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {CONVERSION_FUNNEL.map((row, i) => (
                  <Cell key={i} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Response Time Trend"
          subtitle="Seconds to first reply — last 30 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={RESPONSE_TREND}
              margin={{ top: 6, right: 18, left: -10, bottom: 4 }}
            >
              <defs>
                <linearGradient id="emeraldFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--emerald-bright)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--emerald-bright)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                tickFormatter={(v) => `${v}s`}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}s`, 'Response']}
                labelFormatter={(l) => `Day ${l}`}
              />
              <Area
                type="monotone"
                dataKey="seconds"
                stroke="var(--emerald-bright)"
                strokeWidth={2.5}
                fill="url(#emeraldFade)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead Source Mix" subtitle="Where deals are coming from">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              height: '100%',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LEAD_SOURCE}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="var(--surface-1)"
                >
                  {LEAD_SOURCE.map((row, i) => (
                    <Cell key={i} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingRight: 8,
              }}
            >
              {LEAD_SOURCE.map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--text-bright)',
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: row.color,
                        display: 'inline-block',
                      }}
                    />
                    {row.name}
                  </span>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {row.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Agent Leaderboard */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Agent Performance Leaderboard
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Ranked by revenue attributed this period
            </div>
          </div>
        </div>
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Agent</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>Deals</th>
                  <th style={{ textAlign: 'right' }}>Avg Deal</th>
                  <th style={{ textAlign: 'right' }}>Avg Response</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((row, i) => (
                  <tr key={row.agent}>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        color: 'var(--text-bright)',
                        fontWeight: 500,
                      }}
                    >
                      {row.agent}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        color: 'var(--emerald-bright)',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(row.revenue)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {row.deals}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {row.avg ? formatCurrency(row.avg) : '—'}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {row.response}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weekly trends */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Weekly trends
        </div>
        <div
          className="analytics-trends-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {WEEKLY_TRENDS.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="dark-card"
                style={{
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'color-mix(in srgb, var(--emerald-bright) 14%, transparent)',
                    color: 'var(--emerald-bright)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                      marginTop: 2,
                    }}
                  >
                    {t.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {t.hint}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.analytics-kpi-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.analytics-chart-grid) {
            grid-template-columns: 1fr !important;
          }
          :global(.analytics-trends-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          :global(.analytics-kpi-grid),
          :global(.analytics-trends-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
