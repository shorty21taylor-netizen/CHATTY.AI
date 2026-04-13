'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  TrendingUp,
  Target,
  DollarSign,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  FileText,
  CalendarCheck,
  UserPlus,
  AlertCircle,
  Zap,
  Trophy,
  Activity,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const KPI_CARDS = [
  {
    id: 'leads',
    label: 'Total Leads',
    icon: Users,
    value: '1,284',
    delta: 12.4,
    positive: true,
    series: [
      { x: 'Mon', y: 142 },
      { x: 'Tue', y: 168 },
      { x: 'Wed', y: 181 },
      { x: 'Thu', y: 204 },
      { x: 'Fri', y: 193 },
      { x: 'Sat', y: 166 },
      { x: 'Sun', y: 230 },
    ],
  },
  {
    id: 'roi',
    label: 'Ad Spend ROI',
    icon: TrendingUp,
    value: '4.8x',
    delta: 0.6,
    positive: true,
    suffix: 'x',
    series: [
      { x: 'Mon', y: 3.9 },
      { x: 'Tue', y: 4.1 },
      { x: 'Wed', y: 4.0 },
      { x: 'Thu', y: 4.3 },
      { x: 'Fri', y: 4.6 },
      { x: 'Sat', y: 4.7 },
      { x: 'Sun', y: 4.8 },
    ],
  },
  {
    id: 'conv',
    label: 'Conversion Rate',
    icon: Target,
    value: '23.6%',
    delta: -1.8,
    positive: false,
    series: [
      { x: 'Mon', y: 25.4 },
      { x: 'Tue', y: 24.9 },
      { x: 'Wed', y: 24.1 },
      { x: 'Thu', y: 23.8 },
      { x: 'Fri', y: 23.2 },
      { x: 'Sat', y: 23.4 },
      { x: 'Sun', y: 23.6 },
    ],
  },
  {
    id: 'pipeline',
    label: 'Revenue Pipeline',
    icon: DollarSign,
    value: '$284k',
    delta: 18.2,
    positive: true,
    series: [
      { x: 'Mon', y: 192 },
      { x: 'Tue', y: 214 },
      { x: 'Wed', y: 228 },
      { x: 'Thu', y: 251 },
      { x: 'Fri', y: 266 },
      { x: 'Sat', y: 271 },
      { x: 'Sun', y: 284 },
    ],
  },
];

const FUNNEL_STAGES = [
  { stage: 'New', count: 1284 },
  { stage: 'Contacted', count: 942 },
  { stage: 'Qualified', count: 568 },
  { stage: 'Proposal', count: 312 },
  { stage: 'Closed', count: 147 },
];

const CHANNEL_DATA = [
  { week: 'W1', Google: 124, Facebook: 88, Referrals: 42 },
  { week: 'W2', Google: 138, Facebook: 102, Referrals: 51 },
  { week: 'W3', Google: 156, Facebook: 118, Referrals: 47 },
  { week: 'W4', Google: 172, Facebook: 134, Referrals: 58 },
];

const TOP_AGENTS = [
  {
    id: 'a1',
    name: 'Inbound Sales Agent',
    calls: 412,
    conversion: 31,
    revenue: 84200,
    trend: [18, 24, 27, 31, 28, 34, 38],
  },
  {
    id: 'a2',
    name: 'Appointment Setter',
    calls: 287,
    conversion: 26,
    revenue: 52400,
    trend: [12, 14, 18, 22, 19, 24, 26],
  },
  {
    id: 'a3',
    name: 'Speed-to-Lead',
    calls: 241,
    conversion: 24,
    revenue: 47100,
    trend: [10, 14, 16, 15, 20, 22, 24],
  },
  {
    id: 'a4',
    name: 'After-Hours Responder',
    calls: 168,
    conversion: 21,
    revenue: 31800,
    trend: [8, 9, 11, 14, 13, 17, 21],
  },
  {
    id: 'a5',
    name: 'Ghosted Bid Reopener',
    calls: 94,
    conversion: 19,
    revenue: 28700,
    trend: [4, 6, 7, 10, 12, 15, 19],
  },
];

const ACTIVITY_FEED = [
  {
    id: 1,
    icon: UserPlus,
    color: '#10b981',
    title: 'New lead: Marcus Miller (roofing — storm damage)',
    ts: '2 min ago',
  },
  {
    id: 2,
    icon: PhoneCall,
    color: '#818cf8',
    title: 'Call completed · Appointment Setter · 3m 42s',
    ts: '8 min ago',
  },
  {
    id: 3,
    icon: CheckCircle2,
    color: '#10b981',
    title: 'Deal closed · Patel re-roof · $18,400',
    ts: '22 min ago',
  },
  {
    id: 4,
    icon: FileText,
    color: '#fbbf24',
    title: 'Estimate sent · Thompson HVAC replacement',
    ts: '1h ago',
  },
  {
    id: 5,
    icon: MessageSquare,
    color: '#818cf8',
    title: 'SMS follow-up queued for 4 stale leads',
    ts: '1h ago',
  },
  {
    id: 6,
    icon: CalendarCheck,
    color: '#10b981',
    title: 'Appointment booked · Ruiz inspection · Thu 10:30a',
    ts: '2h ago',
  },
  {
    id: 7,
    icon: Zap,
    color: '#fbbf24',
    title: 'Speed-to-Lead fired · 6 new web leads within 60s',
    ts: '3h ago',
  },
  {
    id: 8,
    icon: AlertCircle,
    color: '#fb7185',
    title: 'Risk flag · NWS severe storm tomorrow 2–4pm',
    ts: '4h ago',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Analytics</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Performance Insights
        </h1>
        <p
          className="t-body"
          style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 640 }}
        >
          What Chatty is producing for your business — leads, conversion, and
          revenue velocity across every channel.
        </p>
      </motion.div>

      {/* TOP ROW — KPI cards */}
      <motion.div
        variants={container}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        {KPI_CARDS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </motion.div>

      {/* MIDDLE ROW — Funnel + Channel Performance */}
      <motion.div
        variants={container}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          marginBottom: 22,
        }}
      >
        <motion.div variants={item} className="dark-card" style={{ padding: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 4 }}>
            Pipeline
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <h2 className="t-h2" style={{ margin: 0 }}>
              Lead funnel
            </h2>
            <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
              5-stage conversion
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={FUNNEL_STAGES}
              margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
              barCategoryGap={10}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--grid-line)"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--text-subtle)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                tick={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                cursor={{ fill: 'var(--hover-bg)' }}
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--text-bright)',
                }}
                formatter={(v) => [v.toLocaleString(), 'Leads']}
              />
              <defs>
                <linearGradient id="funnel-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="count"
                fill="url(#funnel-grad)"
                radius={[0, 8, 8, 0]}
                label={{
                  position: 'right',
                  fill: 'var(--text-bright)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="dark-card" style={{ padding: 24 }}>
          <div className="t-eyebrow" style={{ marginBottom: 4 }}>
            Channels
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <h2 className="t-h2" style={{ margin: 0 }}>
              Channel performance
            </h2>
            <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
              Last 4 weeks · leads
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={CHANNEL_DATA}
              margin={{ top: 4, right: 12, bottom: 4, left: -12 }}
              barCategoryGap={18}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--grid-line)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-subtle)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--hover-bg)' }}
                contentStyle={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: 'var(--text-bright)',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  paddingTop: 8,
                }}
                iconType="circle"
              />
              <Bar
                dataKey="Google"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="Facebook"
                fill="#818cf8"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="Referrals"
                fill="#fbbf24"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* BOTTOM ROW — Top agents + Activity feed */}
      <motion.div
        variants={container}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 18,
        }}
      >
        <motion.div
          variants={item}
          className="dark-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                className="t-eyebrow"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Trophy size={11} style={{ color: 'var(--emerald-bright)' }} />
                Top performers
              </div>
              <h2 className="t-h2" style={{ margin: '4px 0 0' }}>
                Top performing agents
              </h2>
            </div>
            <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
              Last 30 days
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-subtle)',
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'var(--surface-2)',
                  }}
                >
                  <th style={{ padding: '10px 24px', fontWeight: 700 }}>
                    Agent
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  >
                    Calls
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  >
                    Conv %
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  >
                    Revenue
                  </th>
                  <th
                    style={{
                      padding: '10px 24px',
                      fontWeight: 700,
                      textAlign: 'right',
                      width: 130,
                    }}
                  >
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_AGENTS.map((a, i) => (
                  <tr
                    key={a.id}
                    style={{
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td
                      style={{
                        padding: '14px 24px',
                        fontWeight: 600,
                        color: 'var(--text-bright)',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background:
                              i === 0
                                ? 'var(--emerald-tint)'
                                : 'var(--surface-2)',
                            color:
                              i === 0
                                ? 'var(--emerald-bright)'
                                : 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            border: '1px solid var(--border)',
                          }}
                        >
                          {i + 1}
                        </span>
                        {a.name}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {a.calls}
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-bright)',
                        fontWeight: 600,
                      }}
                    >
                      {a.conversion}%
                    </td>
                    <td
                      style={{
                        padding: '14px 12px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--emerald-bright)',
                        fontWeight: 700,
                      }}
                    >
                      ${(a.revenue / 1000).toFixed(1)}k
                    </td>
                    <td style={{ padding: '10px 24px', width: 130 }}>
                      <AgentSparkline data={a.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="dark-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                className="t-eyebrow"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Activity size={11} style={{ color: '#818cf8' }} />
                Live feed
              </div>
              <h2 className="t-h2" style={{ margin: '4px 0 0' }}>
                Recent activity
              </h2>
            </div>
            <motion.span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                display: 'inline-block',
              }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
          <div style={{ maxHeight: 440, overflowY: 'auto' }}>
            {ACTIVITY_FEED.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${f.color}22`,
                      border: `1px solid ${f.color}44`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} style={{ color: f.color }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-bright)',
                        lineHeight: 1.45,
                        marginBottom: 2,
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'var(--text-subtle)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {f.ts}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

function KpiCard({ kpi }) {
  const Icon = kpi.icon;
  const Arrow = kpi.positive ? ArrowUpRight : ArrowDownRight;
  const deltaColor = kpi.positive ? 'var(--emerald-bright)' : '#fb7185';
  const deltaBg = kpi.positive
    ? 'rgba(16,185,129,0.1)'
    : 'rgba(251,113,133,0.1)';
  const deltaBorder = kpi.positive
    ? 'rgba(16,185,129,0.28)'
    : 'rgba(251,113,133,0.28)';

  return (
    <motion.div
      variants={item}
      className="dark-card"
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'var(--emerald-tint)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={13} style={{ color: 'var(--emerald-bright)' }} />
          </span>
          <span
            className="t-eyebrow"
            style={{ color: 'var(--text-muted)' }}
          >
            {kpi.label}
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
            color: deltaColor,
            background: deltaBg,
            border: `1px solid ${deltaBorder}`,
          }}
        >
          <Arrow size={10} />
          {Math.abs(kpi.delta)}
          {kpi.suffix || '%'}
        </span>
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {kpi.value}
      </div>

      <div style={{ marginTop: 'auto', height: 52 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={kpi.series}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`kpi-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 11,
                padding: '4px 8px',
                color: 'var(--text-bright)',
              }}
              labelStyle={{ color: 'var(--text-muted)', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#kpi-${kpi.id})`}
              dot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Agent row sparkline
// ---------------------------------------------------------------------------

function AgentSparkline({ data }) {
  const formatted = data.map((y, i) => ({ x: i, y }));
  return (
    <div style={{ height: 32, width: 120, marginLeft: 'auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <Line
            type="monotone"
            dataKey="y"
            stroke="#10b981"
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
