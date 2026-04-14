'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  Bell,
  Zap,
  RotateCcw,
  Calendar,
  FileText,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';

// Recharts wrapped in dynamic import (client-only) for the activity chart
const ActivityChart = dynamic(() => import('@/components/ActivityChart'), {
  ssr: false,
});

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const OPERATOR_NAME = 'Marcus';

const REVENUE_KPI = {
  id: 'revenue',
  label: 'Revenue Generated',
  icon: DollarSign,
  value: '$48,200',
  delta: 15,
  deltaLabel: '+15%',
  positive: true,
  series: [28, 32, 36, 39, 42, 45, 48],
};

const QUALITY_KPIS = [
  { id: 'answer-rate', label: 'Answer Rate', value: '94.2%', delta: '+2.1%' },
  { id: 'time-to-answer', label: 'Time to Answer', value: '0.8s', delta: '-12%' },
  { id: 'qualification', label: 'Qualification Rate', value: '67%', delta: '+4%' },
  { id: 'booking', label: 'Booking Rate', value: '38%', delta: '+6%' },
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
            Here&apos;s what your AI sales team did overnight.
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

      {/* Revenue Hero (kept as-is) */}
      <motion.div variants={container}>
        <RevenueHeroCard kpi={REVENUE_KPI} />
      </motion.div>

      {/* SECTION 1 — Core Sellers: what Chatty did today */}
      <motion.div variants={item} style={{ marginTop: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div className="t-eyebrow">WHAT CHATTY DID TODAY</div>
          <span className="t-body-sm">Updated live · All agents active</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}
          className="core-sellers-grid"
        >
          <SellerCard
            icon={<Zap size={18} />}
            iconBg="rgba(16,185,129,0.12)"
            iconColor="var(--emerald-bright)"
            agent="SPEED-TO-LEAD"
            value="47"
            label="leads contacted in under 60 seconds"
            delta="+12 vs yesterday"
            deltaPositive
            footer="Avg response: 38s"
          />
          <SellerCard
            icon={<RotateCcw size={18} />}
            iconBg="rgba(139,92,246,0.12)"
            iconColor="#8b5cf6"
            agent="DEAD LEAD REACTIVATION"
            value="23"
            label="cold leads reawakened"
            delta="6 replied · 2 booked"
            deltaPositive
            footer="$38,400 pipeline unlocked"
          />
          <SellerCard
            icon={<Calendar size={18} />}
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#3b82f6"
            agent="BOOKED CALLS"
            value="18"
            label="appointments on the calendar"
            delta="+4 vs yesterday"
            deltaPositive
            footer="Next: Mike R. at 2:30pm"
          />
          <SellerCard
            icon={<FileText size={18} />}
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#f59e0b"
            agent="QUOTES SENT + FOLLOWED UP"
            value="12"
            label="quotes sent · 34 follow-ups fired"
            delta="5 viewed today"
            deltaPositive
            footer="3 ready to close"
          />
          <SellerCard
            icon={<MessageSquare size={18} />}
            iconBg="rgba(236,72,153,0.12)"
            iconColor="#ec4899"
            agent="FOLLOW-UP TEXTS"
            value="142"
            label="texts sent across all agents"
            delta="28% reply rate"
            deltaPositive
            footer="Top: Estimate Follow-Up"
          />
        </div>
      </motion.div>

      {/* SECTION 2 — Activity chart */}
      <motion.div
        variants={item}
        className="dark-card"
        style={{ padding: 24, marginTop: 24 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Agent activity this week
            </h2>
            <p className="t-body-sm" style={{ margin: '4px 0 0' }}>
              What every agent is producing, day over day.
            </p>
          </div>
        </div>
        <ActivityChart />
      </motion.div>

      {/* SECTION 3 — Live Agent Status */}
      <motion.div
        variants={item}
        className="dark-card"
        style={{ padding: 24, marginTop: 24 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 className="t-h2" style={{ margin: 0 }}>
              Your sales team
            </h2>
            <p className="t-body-sm" style={{ margin: '4px 0 0' }}>
              6 of 10 agents active · All systems operational
            </p>
          </div>
          <Link
            href="/dashboard/agents"
            style={{
              color: 'var(--emerald-bright)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Manage agents →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
          className="agent-status-grid"
        >
          <AgentRow
            name="Speed-to-Lead"
            lastAction="Contacted 3 leads, 4 min ago"
            icon={<Zap size={14} />}
            iconColor="var(--emerald-bright)"
          />
          <AgentRow
            name="Inbound Qualifier"
            lastAction="Answered 1 call, 12 min ago"
            icon={<Phone size={14} />}
            iconColor="var(--emerald-bright)"
          />
          <AgentRow
            name="SMS Concierge"
            lastAction="Replied to Mike R., 2 min ago"
            icon={<MessageSquare size={14} />}
            iconColor="var(--emerald-bright)"
          />
          <AgentRow
            name="Estimate Follow-Up"
            lastAction="Sent 12 follow-ups today"
            icon={<FileText size={14} />}
            iconColor="#f59e0b"
          />
          <AgentRow
            name="No-Show Rescue"
            lastAction="Rescued 2 no-shows today"
            icon={<Clock size={14} />}
            iconColor="#3b82f6"
          />
          <AgentRow
            name="Dead Lead Reactivation"
            lastAction="Reawakened 23 leads, 6 replied"
            icon={<RotateCcw size={14} />}
            iconColor="#8b5cf6"
          />
        </div>
      </motion.div>

      {/* SECTION 4 — Quality Strip */}
      <motion.div variants={item} style={{ marginTop: 32 }}>
        <div className="t-eyebrow" style={{ marginBottom: 12 }}>
          AGENT QUALITY
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
          className="quality-strip-grid"
        >
          {QUALITY_KPIS.map((k) => (
            <QualityKpi key={k.id} label={k.label} value={k.value} delta={k.delta} />
          ))}
        </div>
      </motion.div>

      {/* Responsive fallbacks */}
      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.core-sellers-grid) {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          :global(.agent-status-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.quality-strip-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          :global(.core-sellers-grid),
          :global(.agent-status-grid),
          :global(.quality-strip-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Revenue hero card (unchanged — kept per spec)
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
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--emerald-hover)',
                marginBottom: 8,
              }}
            >
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
// SellerCard — Core Sellers row
// ---------------------------------------------------------------------------

function SellerCard({
  icon,
  iconBg,
  iconColor,
  agent,
  value,
  label,
  delta,
  deltaPositive,
  footer,
}) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 180,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            textAlign: 'right',
            lineHeight: 1.2,
          }}
        >
          {agent}
        </span>
      </div>
      <div>
        <div className="t-kpi" style={{ fontSize: 40, lineHeight: 1 }}>
          {value}
        </div>
        <div className="t-body-sm" style={{ marginTop: 6 }}>
          {label}
        </div>
      </div>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: deltaPositive ? 'var(--emerald-bright)' : 'var(--negative)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <TrendingUp size={12} /> {delta}
        </div>
        <div className="t-body-sm" style={{ marginTop: 2, fontSize: 11 }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AgentRow — Live Agent Status
// ---------------------------------------------------------------------------

function AgentRow({ name, lastAction, icon, iconColor }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: 8,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `color-mix(in srgb, ${iconColor} 14%, transparent)`,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-bright)',
            }}
          >
            {name}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--emerald-bright)',
              boxShadow: '0 0 6px var(--emerald-glow)',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {lastAction}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QualityKpi — compact bottom strip
// ---------------------------------------------------------------------------

function QualityKpi({ label, value, delta }) {
  const positive = !delta || !delta.startsWith('-') || label === 'Time to Answer';
  return (
    <div className="dark-card" style={{ padding: 18 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <CheckCircle size={11} style={{ color: 'var(--emerald-bright)' }} />
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {delta ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            fontWeight: 600,
            color: positive ? 'var(--emerald-bright)' : 'var(--negative)',
          }}
        >
          {delta} vs last week
        </div>
      ) : null}
    </div>
  );
}
