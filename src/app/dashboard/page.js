'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  Bell,
  Zap,
  RotateCcw,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';

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
                background: 'var(--primary)',
                boxShadow: '0 0 8px rgba(15, 138, 79, 0.2)',
                display: 'inline-block',
              }}
            />
            Command Center · {todayDate}
          </div>
          <h1
            className="t-h1"
            style={{ margin: '8px 0 4px' }}
          >
            Today
          </h1>
          <p
            className="t-body"
            style={{ color: 'var(--text-muted)', margin: 0 }}
          >
            Good morning, {OPERATOR_NAME}. Here&apos;s what your AI sales team did overnight.
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
              background: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              border: '1px solid var(--primary)',
              boxShadow: '0 1px 3px rgba(15, 138, 79, 0.2)',
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
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>WHAT CHATTY DID TODAY</span>
          <span className="t-body-sm" style={{ letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}>Updated live · All agents active</span>
        </div>

        {/* Top row — 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="sellers-row-top">
          <SellerCard
            href="/dashboard/speed-to-lead"
            icon={<Zap size={22} />}
            iconBg="rgba(15,138,79,0.10)"
            iconColor="var(--primary)"
            agent="Speed-to-Lead"
            value="47"
            label="leads contacted in under 60 seconds"
            delta="+12 vs yesterday"
            deltaPositive
            footer="Avg response: 38s"
          />
          <SellerCard
            href="/dashboard/follow-ups"
            icon={<RotateCcw size={22} />}
            iconBg="rgba(139,92,246,0.12)"
            iconColor="#8b5cf6"
            agent="Dead Lead Reactivation"
            value="23"
            label="cold leads reawakened"
            delta="6 replied · 2 booked"
            deltaPositive
            footer="$38,400 pipeline unlocked"
          />
          <SellerCard
            href="/dashboard/booked-calls"
            icon={<Calendar size={22} />}
            iconBg="rgba(59,130,246,0.12)"
            iconColor="#3b82f6"
            agent="Booked Calls"
            value="18"
            label="appointments on the calendar"
            delta="+4 vs yesterday"
            deltaPositive
            footer="Next: Mike R. at 2:30pm"
          />
        </div>
        {/* Bottom row — 2 cards, centered */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginTop: 20 }} className="sellers-row-bottom">
          <SellerCard
            href="/dashboard/proposals-out"
            icon={<FileText size={22} />}
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#f59e0b"
            agent="Quotes Sent + Followed Up"
            value="12"
            label="quotes sent · 34 follow-ups fired"
            delta="5 viewed today"
            deltaPositive
            footer="3 ready to close"
          />
          <SellerCard
            href="/dashboard/follow-ups"
            icon={<MessageSquare size={22} />}
            iconBg="rgba(236,72,153,0.12)"
            iconColor="#ec4899"
            agent="Follow-Up Texts"
            value="142"
            label="texts sent across all agents"
            delta="28% reply rate"
            deltaPositive
            footer="Top: Estimate Follow-Up"
          />
        </div>
      </motion.div>

      {/* SECTION 2 — Agent Quality */}
      <motion.div variants={item} style={{ marginTop: 32 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}>AGENT QUALITY</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
          className="quality-strip-grid"
        >
          <QualityCard icon={<CheckCircle size={20} />} name="Answer Rate" value="94.2%" delta="+2.1% vs last week" positive />
          <QualityCard icon={<Clock size={20} />} name="Time to Answer" value="0.8s" delta="-12% vs last week" positive />
          <QualityCard icon={<TrendingUp size={20} />} name="Qualification Rate" value="67%" delta="+4% vs last week" positive />
          <QualityCard icon={<Calendar size={20} />} name="Booking Rate" value="38%" delta="+6% vs last week" positive />
        </div>
      </motion.div>

      {/* Responsive fallbacks */}
      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.sellers-row-top) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.sellers-row-bottom) {
            grid-template-columns: 1fr !important;
          }
          :global(.quality-strip-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          :global(.sellers-row-top),
          :global(.sellers-row-bottom),
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
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white py-8 px-6 sm:px-8 shadow-sm"
      style={{ borderLeft: '4px solid var(--primary)' }}
    >
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--primary-tint)' }}
          >
            <Icon size={26} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="min-w-0">
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--primary-dark)',
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
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
            style={{ background: 'var(--primary-tint)', color: 'var(--primary-dark)' }}
          >
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
                    <stop offset="0%" stopColor="#0F8A4F" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#0F8A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#0F8A4F"
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

function SellerCard({ href, icon, iconBg, iconColor, agent, value, label, delta, deltaPositive, footer }) {
  const [hover, setHover] = useState(false);
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href
    ? {
        href,
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: { textDecoration: 'none', color: 'inherit', display: 'block' },
      }
    : {};

  return (
    <Wrapper {...wrapperProps}>
      <div
        className="dark-card"
        style={{
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 220,
          cursor: href ? 'pointer' : 'default',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          borderColor: hover ? 'var(--border-strong)' : undefined,
          boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.06)' : undefined,
        }}
      >
        {/* Top: icon + agent name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: iconBg, color: iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{icon}</div>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-bright)',
            letterSpacing: '-0.01em',
          }}>{agent}</span>
        </div>

        {/* Big number */}
        <div style={{
          fontSize: 56,
          fontWeight: 800,
          color: 'var(--text-bright)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontFamily: 'var(--font-display)',
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</div>

        {/* Description */}
        <div style={{
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.4,
        }}>{label}</div>

        {/* Footer: delta + context */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: deltaPositive ? 'var(--primary)' : 'var(--negative)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <TrendingUp size={14} /> {delta}
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--text-subtle)',
          }}>{footer}</span>
        </div>
      </div>
    </Wrapper>
  );
}

// ---------------------------------------------------------------------------
// QualityCard — agent quality metrics
// ---------------------------------------------------------------------------

function QualityCard({ icon, name, value, delta, positive }) {
  return (
    <div className="dark-card" style={{ padding: 24, minHeight: 160 }}>
      {/* Label row: icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-bright)',
          letterSpacing: '-0.01em',
        }}>{name}</span>
      </div>

      {/* Big number */}
      <div style={{
        fontSize: 44,
        fontWeight: 800,
        color: 'var(--text-bright)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        fontFamily: 'var(--font-display)',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>

      {/* Delta */}
      <div style={{
        marginTop: 14,
        fontSize: 13,
        fontWeight: 600,
        color: positive ? 'var(--primary)' : 'var(--negative)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <TrendingUp size={13} /> {delta}
      </div>
    </div>
  );
}
