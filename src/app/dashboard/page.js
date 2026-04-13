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
  Play,
  Volume2,
  Users,
  Clock,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Phone,
  CalendarCheck,
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

const BRIEF_PRIORITY = 'high';
const BRIEF_ACTIONS = [
  {
    id: 1,
    text: 'Callback sprint on 3 stale Google LSA leads (4h+ old)',
    impact: '$12,400 opportunity',
    tone: 'emerald',
  },
  {
    id: 2,
    text: 'Push Miller roof estimate from draft to sent before lunch',
    impact: '$18,700 recoverable',
    tone: 'emerald',
  },
  {
    id: 3,
    text: 'Reroute Thompson + Patel tear-offs around tomorrow\'s 2–4pm storm cell',
    impact: 'Storm prep',
    tone: 'amber',
  },
  {
    id: 4,
    text: 'Pause the underperforming Facebook "roof repair general" creative',
    impact: '15% cost reduction',
    tone: 'indigo',
  },
];

const PRIORITY_META = {
  high: {
    label: 'HIGH PRIORITY',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.4)',
    color: '#fb7185',
  },
  medium: {
    label: 'MEDIUM PRIORITY',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    color: '#fbbf24',
  },
  low: {
    label: 'LOW PRIORITY',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    color: '#10b981',
  },
};

const IMPACT_TONE = {
  emerald: {
    bg: 'rgba(16,185,129,0.12)',
    color: '#10b981',
    border: 'rgba(16,185,129,0.28)',
  },
  amber: {
    bg: 'rgba(245,158,11,0.12)',
    color: '#fbbf24',
    border: 'rgba(245,158,11,0.28)',
  },
  indigo: {
    bg: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: 'rgba(99,102,241,0.28)',
  },
};

const KPIS = [
  {
    id: 'leads',
    label: 'Total Leads Today',
    icon: Users,
    value: '34',
    delta: 12,
    positive: true,
    series: [12, 18, 22, 19, 26, 28, 34],
  },
  {
    id: 'response',
    label: 'Response Time',
    icon: Clock,
    value: '8 min',
    delta: -23,
    positive: true, // lower is better
    series: [14, 13, 12, 10, 11, 9, 8],
  },
  {
    id: 'pipeline',
    label: 'Pipeline Value',
    icon: DollarSign,
    value: '$142,800',
    delta: 8,
    positive: true,
    series: [112, 118, 122, 128, 134, 138, 142],
  },
  {
    id: 'close',
    label: 'Close Rate',
    icon: Target,
    value: '31%',
    delta: -2,
    positive: false,
    series: [34, 33, 33, 32, 32, 31, 31],
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

      {/* ROW 1 — Today's Brief */}
      <motion.div variants={item} style={{ marginBottom: 22 }}>
        <TodayBriefCard date={todayDate} />
      </motion.div>

      {/* ROW 2 — KPI grid */}
      <motion.div
        variants={container}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 22,
        }}
      >
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </motion.div>

      {/* ROW 3 — Agents + Activity */}
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
// Today's Brief card
// ---------------------------------------------------------------------------

function TodayBriefCard({ date }) {
  const priority = PRIORITY_META[BRIEF_PRIORITY];
  return (
    <div
      className="dark-card"
      style={{
        position: 'relative',
        padding: '24px 28px',
        paddingLeft: 30,
        overflow: 'hidden',
      }}
    >
      {/* Gradient left border */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 4,
          background:
            'linear-gradient(180deg, #10b981 0%, #6366f1 100%)',
          boxShadow: '0 0 18px rgba(16,185,129,0.25)',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--emerald-tint)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={16} style={{ color: 'var(--emerald-bright)' }} fill="currentColor" />
          </span>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 2 }}>
              Decision Engine · 6:00a
            </div>
            <div
              className="t-h2"
              style={{ margin: 0, letterSpacing: '-0.005em' }}
            >
              Today&apos;s Intelligence Brief
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            {date}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              background: priority.bg,
              color: priority.color,
              border: `1px solid ${priority.border}`,
            }}
          >
            {priority.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BRIEF_ACTIONS.map((a) => {
          const tone = IMPACT_TONE[a.tone] || IMPACT_TONE.emerald;
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, var(--emerald-bright), #6366f1)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {a.id}
              </span>
              <div
                style={{
                  flex: 1,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  color: 'var(--text-bright)',
                  minWidth: 0,
                }}
              >
                {a.text}
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  background: tone.bg,
                  color: tone.color,
                  border: `1px solid ${tone.border}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {a.impact}
              </span>
            </div>
          );
        })}
      </div>

      {/* Voice note */}
      <div
        style={{
          marginTop: 16,
          padding: '12px 14px',
          borderRadius: 12,
          background:
            'linear-gradient(90deg, rgba(16,185,129,0.06), rgba(99,102,241,0.06))',
          border: '1px dashed rgba(16,185,129,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          type="button"
          aria-label="Play voice summary"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--emerald-bright)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          }}
        >
          <Play size={13} fill="#ffffff" style={{ marginLeft: 2 }} />
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-bright)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Volume2 size={13} style={{ color: 'var(--emerald-bright)' }} />
            Listen to voice summary
          </div>
          <div
            className="t-body-sm"
            style={{ color: 'var(--text-muted)', marginTop: 2 }}
          >
            A 47-second walk-through of the four priorities above.
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          0:47
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

function KpiCard({ kpi }) {
  const Icon = kpi.icon;
  const Arrow = kpi.delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const positiveColor = 'var(--emerald-bright)';
  const negativeColor = '#fb7185';
  const color = kpi.positive ? positiveColor : negativeColor;
  const bg = kpi.positive
    ? 'rgba(16,185,129,0.1)'
    : 'rgba(251,113,133,0.1)';
  const borderCol = kpi.positive
    ? 'rgba(16,185,129,0.28)'
    : 'rgba(251,113,133,0.3)';
  const data = kpi.series.map((y, i) => ({ i, y }));

  return (
    <motion.div
      variants={item}
      className="dark-card"
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
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
          <span className="t-eyebrow">{kpi.label}</span>
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
            color,
            background: bg,
            border: `1px solid ${borderCol}`,
          }}
        >
          <Arrow size={10} />
          {Math.abs(kpi.delta)}%
        </span>
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {kpi.value}
      </div>

      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`home-kpi-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
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
