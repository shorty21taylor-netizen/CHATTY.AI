'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import {
  Bell,
  Zap,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneCall,
  CalendarCheck,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  FileText,
  MessageSquare,
  CloudLightning,
  Voicemail,
  UserPlus,
  Activity,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const OPERATOR_NAME = 'Marcus';

const KPIS = [
  {
    id: 'inbound',
    label: 'Inbound Calls',
    icon: PhoneIncoming,
    value: '47',
    delta: 18,
    deltaLabel: '+18%',
    positive: true,
    series: [22, 28, 31, 35, 38, 42, 47],
  },
  {
    id: 'outbound',
    label: 'Outbound Calls',
    icon: PhoneOutgoing,
    value: '23',
    delta: 6,
    deltaLabel: '+6%',
    positive: true,
    series: [14, 16, 17, 19, 20, 22, 23],
  },
  {
    id: 'pickup',
    label: 'Avg Pickup Rate',
    icon: PhoneCall,
    value: '94.2%',
    delta: 2.1,
    deltaLabel: '+2.1%',
    positive: true,
    series: [90.4, 91.2, 92.0, 92.8, 93.1, 93.7, 94.2],
  },
  {
    id: 'speed',
    label: 'Answer Speed',
    icon: Zap,
    value: '0.8s',
    delta: -12,
    deltaLabel: '-12%',
    positive: true, // lower is better
    series: [1.4, 1.3, 1.1, 1.0, 0.95, 0.85, 0.8],
  },
  {
    id: 'booked',
    label: 'Booked Calls',
    icon: CalendarCheck,
    value: '31',
    delta: 22,
    deltaLabel: '+22%',
    positive: true,
    series: [12, 16, 19, 22, 25, 28, 31],
  },
  {
    id: 'revenue',
    label: 'Revenue Generated',
    icon: DollarSign,
    value: '$48,200',
    delta: 15,
    deltaLabel: '+15%',
    positive: true,
    series: [28, 32, 36, 39, 42, 45, 48],
  },
];

const ACTIVE_AGENTS = [
  {
    id: 'inbound-sales',
    name: 'Inbound Sales Agent',
    status: 'active',
    callsToday: 12,
    history: [2, 3, 1, 2, 4],
  },
  {
    id: 'appointment-setter',
    name: 'Appointment Setter',
    status: 'active',
    callsToday: 8,
    history: [1, 2, 2, 1, 2],
  },
  {
    id: 'after-hours',
    name: 'After-Hours Responder',
    status: 'idle',
    callsToday: 0,
    history: [0, 0, 0, 0, 0],
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: UserPlus,
    color: '#10b981',
    text: 'New lead from Google Ads · Marcus Miller (storm-damage roof)',
    ts: '2m ago',
  },
  {
    id: 2,
    icon: Voicemail,
    color: '#818cf8',
    text: 'Voicemail transcribed · "Call me back about the HVAC quote"',
    ts: '15m ago',
  },
  {
    id: 3,
    icon: CalendarCheck,
    color: '#10b981',
    text: 'Appointment confirmed · Patel inspection · Thu 10:30a',
    ts: '42m ago',
  },
  {
    id: 4,
    icon: FileText,
    color: '#fbbf24',
    text: 'Proposal sent · Thompson re-roof · $22,400',
    ts: '1h ago',
  },
  {
    id: 5,
    icon: MessageSquare,
    color: '#818cf8',
    text: 'SMS follow-up delivered to 4 stale leads',
    ts: '2h ago',
  },
  {
    id: 6,
    icon: CloudLightning,
    color: '#fb7185',
    text: 'Weather alert received · Severe storm tomorrow 2–4pm',
    ts: '3h ago',
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {/* Header */}
      <motion.div
        variants={item}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 26,
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--emerald-bright)',
                boxShadow: '0 0 8px var(--emerald-glow)',
                display: 'inline-block',
              }}
            />
            Command Center · {todayDate}
          </div>
          <h1
            className="t-h1"
            style={{ margin: '8px 0 4px', letterSpacing: '-0.01em' }}
          >
            Good morning, {OPERATOR_NAME}.
          </h1>
          <p
            className="t-body"
            style={{ color: 'var(--text-muted)', margin: 0 }}
          >
            Here&apos;s what Chatty thinks matters most today.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label="Notifications"
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: 9.5,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--app-bg)',
              }}
            >
              3
            </span>
          </button>
          <Link
            href="/dashboard/brief"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'var(--emerald-bright)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              border: '1px solid var(--emerald-bright)',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            <Zap size={14} fill="#ffffff" />
            View Full Brief
          </Link>
        </div>
      </motion.div>

      {/* ROW 1 — Revenue hero */}
      <motion.div variants={container} className="mb-4">
        <RevenueHeroCard kpi={KPIS.find((k) => k.id === 'revenue')} />
      </motion.div>

      {/* ROW 2 — Inbound / Outbound / Pickup (3 cols) */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
      >
        {KPIS.filter((k) =>
          ['inbound', 'outbound', 'pickup'].includes(k.id)
        ).map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </motion.div>

      {/* ROW 3 — Answer Speed / Booked Calls (2 cols, wider) */}
      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        {KPIS.filter((k) => ['speed', 'booked'].includes(k.id)).map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </motion.div>

      {/* ROW 4 — Agents + Activity */}
      <motion.div
        variants={container}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 18,
        }}
      >
        <ActiveAgentsCard />
        <RecentActivityCard />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Revenue hero card (full width)
// ---------------------------------------------------------------------------

function RevenueHeroCard({ kpi }) {
  if (!kpi) return null;
  const Icon = kpi.icon;
  const Arrow = kpi.delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const data = kpi.series.map((y, i) => ({ i, y }));

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white py-8 px-6 sm:px-8 shadow-sm shadow-[inset_4px_0_0_#10b981] ring-1 ring-emerald-500/20"
    >
      {/* Emerald glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/40">
            <Icon size={26} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Revenue Generated
            </div>
            <div className="mt-1 text-5xl font-bold tracking-tight text-zinc-900 tabular-nums sm:text-6xl">
              {kpi.value}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-500/30">
            <Arrow size={14} />
            {kpi.deltaLabel}
          </span>
          <div className="h-14 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="home-kpi-revenue-hero"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#10b981"
                  strokeWidth={2.25}
                  fill="url(#home-kpi-revenue-hero)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// KPI card (Row 2 + Row 3)
// ---------------------------------------------------------------------------

function KpiCard({ kpi }) {
  const Icon = kpi.icon;
  const Arrow = kpi.delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const data = kpi.series.map((y, i) => ({ i, y }));

  return (
    <motion.div
      variants={item}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {/* Top: icon circle + label + delta badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30">
            <Icon size={20} className="text-emerald-600" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {kpi.label}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-500/30">
          <Arrow size={11} />
          {Math.abs(kpi.delta)}%
        </span>
      </div>

      {/* Number */}
      <div className="text-3xl font-bold leading-none tracking-tight text-zinc-900 tabular-nums">
        {kpi.value}
      </div>

      {/* Trend chart ("progress bar") */}
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient
                id={`home-kpi-${kpi.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke="#10b981"
              strokeWidth={1.75}
              fill={`url(#home-kpi-${kpi.id})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Active Agents card
// ---------------------------------------------------------------------------

function ActiveAgentsCard() {
  const maxCalls = Math.max(...ACTIVE_AGENTS.map((a) => a.callsToday), 1);

  return (
    <motion.div
      variants={item}
      className="dark-card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      <div
        style={{
          padding: '18px 22px',
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
            <Phone size={11} style={{ color: 'var(--emerald-bright)' }} />
            Voice agents
          </div>
          <h2 className="t-h2" style={{ margin: '4px 0 0' }}>
            Active agents
          </h2>
        </div>
        <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
          Today
        </div>
      </div>

      <div style={{ padding: 10 }}>
        {ACTIVE_AGENTS.map((a) => {
          const active = a.status === 'active';
          const pct = Math.round((a.callsToday / maxCalls) * 100);
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 12px',
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: '0 0 230px',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: active ? '#10b981' : '#6b7280',
                    boxShadow: active
                      ? '0 0 8px rgba(16,185,129,0.55)'
                      : 'none',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {a.name}
                </span>
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--emerald-bright)' : 'var(--text-muted)',
                  background: active
                    ? 'var(--emerald-tint)'
                    : 'var(--surface-2)',
                  border: active
                    ? '1px solid rgba(16,185,129,0.28)'
                    : '1px solid var(--border)',
                }}
              >
                {active ? 'Active' : 'Idle'}
              </span>

              {/* Volume bar */}
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: 'var(--surface-2)',
                  borderRadius: 999,
                  overflow: 'hidden',
                  minWidth: 60,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background:
                      'linear-gradient(90deg, #10b981, #6366f1)',
                    borderRadius: 999,
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-bright)',
                  fontVariantNumeric: 'tabular-nums',
                  width: 72,
                  textAlign: 'right',
                }}
              >
                {a.callsToday}{' '}
                <span
                  style={{
                    fontWeight: 500,
                    color: 'var(--text-subtle)',
                    fontSize: 11,
                  }}
                >
                  calls
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          href="/dashboard/agents"
          style={{
            color: 'var(--emerald-bright)',
            fontSize: 12.5,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Manage Agents →
        </Link>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Recent Activity card
// ---------------------------------------------------------------------------

function RecentActivityCard() {
  return (
    <motion.div
      variants={item}
      className="dark-card"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      <div
        style={{
          padding: '18px 22px',
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

      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {RECENT_ACTIVITY.map((row, i) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px 20px',
                borderBottom:
                  i === RECENT_ACTIVITY.length - 1
                    ? 'none'
                    : '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${row.color}22`,
                  border: `1px solid ${row.color}44`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={13} style={{ color: row.color }} />
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
                  {row.text}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-subtle)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.ts}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
