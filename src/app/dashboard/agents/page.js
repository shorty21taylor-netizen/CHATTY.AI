'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  MessageSquare,
  Zap,
  ClipboardList,
  FileText,
  CalendarCheck,
  Shield,
  Star,
  RotateCcw,
  Send,
  Repeat,
  Sparkles,
  Plus,
  ArrowUpRight,
  Activity,
  Clock,
  Wifi,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Agent data
// ---------------------------------------------------------------------------

const TELEGRAM_EA = {
  id: 'telegram-ea',
  name: 'Telegram Executive Assistant',
  description:
    'Your personal AI business advisor on Telegram. Ask anything about your business — revenue, pipeline, agents, what happened today. It knows everything.',
  stats: [
    { label: 'Messages Today', value: '12', icon: MessageCircle },
    { label: 'Avg Response', value: '<2s', icon: Clock },
    { label: 'Uptime', value: '99.9%', icon: Wifi },
  ],
};

const PILLARS = [
  {
    id: 'capture',
    label: 'Capture',
    tagline: 'Lead generation & intake — turn every signal into a conversation.',
    accent: {
      color: '#10b981',
      bright: 'var(--emerald-bright)',
      tint: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.35)',
      glow: 'rgba(16,185,129,0.25)',
    },
    agents: [
      {
        id: 'instant-lead-response',
        name: 'Instant Lead Response',
        icon: Zap,
        status: 'active',
        description:
          'Responds to every incoming lead within 60 seconds, 24/7. Qualifies intent, captures info, routes to calendar.',
        stats: [
          { label: 'Leads Today', value: '8' },
          { label: 'Avg Response', value: '47s' },
          { label: 'Conversion', value: '34%' },
        ],
      },
      {
        id: 'form-bot',
        name: 'Form Bot',
        icon: ClipboardList,
        status: 'active',
        description:
          'Autonomous form submission and lead capture across all web properties.',
        stats: [
          { label: 'Forms Processed', value: '23' },
          { label: 'Capture Rate', value: '91%' },
          { label: 'Errors', value: '0' },
        ],
      },
      {
        id: 'social-dm-agent',
        name: 'Social DM Agent',
        icon: MessageSquare,
        status: 'active',
        description:
          'Handles direct messages on Instagram and Facebook. Engages prospects, answers questions, books consultations.',
        stats: [
          { label: 'DMs Handled', value: '15' },
          { label: 'Response Rate', value: '98%' },
          { label: 'Bookings', value: '4' },
        ],
      },
    ],
  },
  {
    id: 'convert',
    label: 'Convert',
    tagline: 'Sales progression & closing — move deals from interested to signed.',
    accent: {
      color: '#6366f1',
      bright: '#818cf8',
      tint: 'rgba(99,102,241,0.12)',
      border: 'rgba(99,102,241,0.38)',
      glow: 'rgba(99,102,241,0.25)',
    },
    agents: [
      {
        id: 'quote-followup',
        name: 'Quote Follow-Up',
        icon: FileText,
        status: 'active',
        description:
          'Automatically follows up on every quote sent. Nudges at optimal intervals based on engagement signals.',
        stats: [
          { label: 'Active Follow-ups', value: '12' },
          { label: 'Reply Rate', value: '42%' },
          { label: 'Closed', value: '3' },
        ],
      },
      {
        id: 'appointment-setter',
        name: 'Appointment Setter',
        icon: CalendarCheck,
        status: 'active',
        description:
          'Books inspections, estimates, and consultations directly into your calendar. Handles rescheduling.',
        stats: [
          { label: 'Booked Today', value: '6' },
          { label: 'Show Rate', value: '89%' },
          { label: 'No-shows', value: '1' },
        ],
      },
      {
        id: 'objection-handler',
        name: 'Objection Handler',
        icon: Shield,
        status: 'active',
        description:
          'Addresses pricing concerns, competitor comparisons, and timing objections with proven scripts.',
        stats: [
          { label: 'Objections Handled', value: '9' },
          { label: 'Win Rate', value: '67%' },
          { label: 'Escalated', value: '2' },
        ],
      },
      {
        id: 'review-request',
        name: 'Review Request',
        icon: Star,
        status: 'active',
        description:
          'Requests and collects 5-star reviews after completed jobs. Follows up until review is posted.',
        stats: [
          { label: 'Requests Sent', value: '5' },
          { label: 'Reviews Collected', value: '3' },
          { label: 'Avg Rating', value: '4.8' },
        ],
      },
    ],
  },
  {
    id: 'reclaim',
    label: 'Reclaim',
    tagline: 'Recovery & re-engagement — resurrect pipeline left for dead.',
    accent: {
      color: '#f59e0b',
      bright: '#fbbf24',
      tint: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.38)',
      glow: 'rgba(245,158,11,0.25)',
    },
    agents: [
      {
        id: 'dead-lead-reactivation',
        name: 'Dead Lead Reactivation',
        icon: RotateCcw,
        status: 'active',
        description:
          'Reactivates leads older than 60+ days with personalized re-engagement sequences.',
        stats: [
          { label: 'Reactivated', value: '4' },
          { label: 'Pipeline Added', value: '$12,400' },
          { label: 'Response Rate', value: '18%' },
        ],
      },
      {
        id: 'ghosted-bid-followup',
        name: 'Ghosted Bid Follow-Up',
        icon: Send,
        status: 'active',
        description:
          'Automatic follow-up on quotes that received no response. Uses escalating urgency.',
        stats: [
          { label: 'Active Bids', value: '7' },
          { label: 'Responses', value: '2' },
          { label: 'Recovered', value: '$8,200' },
        ],
      },
      {
        id: 'past-customer-reengagement',
        name: 'Past Customer Re-engagement',
        icon: Repeat,
        status: 'paused',
        description:
          'Re-engages previous customers for repeat business, referrals, and seasonal maintenance.',
        stats: [
          { label: 'Contacted', value: '11' },
          { label: 'Repeat Jobs', value: '2' },
          { label: 'Referrals', value: '1' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const totalAgents =
    1 + PILLARS.reduce((sum, p) => sum + p.agents.length, 0);
  const activeAgents =
    1 +
    PILLARS.reduce(
      (sum, p) => sum + p.agents.filter((a) => a.status === 'active').length,
      0
    );

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: 28 }}>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Sparkles size={11} style={{ color: 'var(--emerald-bright)' }} />
          AI workforce · {activeAgents}/{totalAgents} active
        </div>
        <h1
          className="t-h1"
          style={{ margin: '8px 0 6px', letterSpacing: '-0.01em' }}
        >
          Your AI Agents
        </h1>
        <p
          className="t-body"
          style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 680 }}
        >
          Eleven specialized agents organized across three pillars —{' '}
          <strong style={{ color: '#10b981' }}>Capture</strong>,{' '}
          <strong style={{ color: '#818cf8' }}>Convert</strong>, and{' '}
          <strong style={{ color: '#fbbf24' }}>Reclaim</strong> — plus your
          Telegram executive assistant working in the background 24/7.
        </p>
      </motion.div>

      {/* Telegram EA hero */}
      <motion.div variants={item}>
        <TelegramHeroCard agent={TELEGRAM_EA} />
      </motion.div>

      {/* Pillars */}
      {PILLARS.map((pillar) => (
        <PillarSection key={pillar.id} pillar={pillar} />
      ))}

      {/* Create Custom Agent CTA */}
      <motion.div
        variants={item}
        style={{
          marginTop: 32,
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 10,
            background: 'transparent',
            color: 'var(--emerald-bright)',
            fontWeight: 700,
            fontSize: 13,
            border: '1.5px solid var(--emerald-bright)',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          <Plus size={14} />
          Create Custom Agent
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Telegram EA hero
// ---------------------------------------------------------------------------

function TelegramHeroCard({ agent }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: 2,
        borderRadius: 18,
        background:
          'linear-gradient(135deg, rgba(16,185,129,0.7), rgba(99,102,241,0.7), rgba(251,191,36,0.6))',
        marginBottom: 36,
        boxShadow:
          '0 20px 50px -20px rgba(16,185,129,0.25), 0 0 0 1px rgba(255,255,255,0.03) inset',
      }}
    >
      <div
        className="dark-card"
        style={{
          padding: '24px 28px',
          borderRadius: 16,
          background:
            'linear-gradient(180deg, var(--surface-1) 0%, rgba(16,185,129,0.04) 100%)',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
          border: 'none',
        }}
      >
        {/* Icon tile */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background:
              'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 10px 30px -8px rgba(16,185,129,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
            flexShrink: 0,
          }}
        >
          <MessageCircle
            size={30}
            style={{ color: '#ffffff' }}
            fill="#ffffff"
          />
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span
              className="t-eyebrow"
              style={{
                color: '#fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Star size={10} fill="#fbbf24" /> Featured · Premium
            </span>
            <ActiveBadge label="Active" dot />
          </div>
          <h2
            className="t-h1"
            style={{
              margin: '4px 0 8px',
              fontSize: 24,
              letterSpacing: '-0.01em',
            }}
          >
            {agent.name}
          </h2>
          <p
            className="t-body"
            style={{
              color: 'var(--text-muted)',
              margin: 0,
              maxWidth: 540,
              lineHeight: 1.5,
            }}
          >
            {agent.description}
          </p>
        </div>

        {/* Stats + CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'stretch',
            minWidth: 220,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            {agent.stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      color: 'var(--text-subtle)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                    }}
                  >
                    <Icon size={9} />
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: 'var(--text-bright)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 18px',
              borderRadius: 10,
              background: 'var(--emerald-bright)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              border: '1px solid var(--emerald-bright)',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(16,185,129,0.4)',
            }}
          >
            <MessageCircle size={14} fill="#ffffff" />
            Message on Telegram
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pillar section
// ---------------------------------------------------------------------------

function PillarSection({ pillar }) {
  return (
    <motion.section
      variants={item}
      style={{ marginBottom: 28 }}
      aria-labelledby={`pillar-${pillar.id}`}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          marginBottom: 14,
          borderRadius: 10,
          background: pillar.accent.tint,
          borderLeft: `3px solid ${pillar.accent.bright}`,
          border: `1px solid ${pillar.accent.border}`,
          borderLeftWidth: 3,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `${pillar.accent.color}22`,
            border: `1px solid ${pillar.accent.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Activity size={15} style={{ color: pillar.accent.bright }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            id={`pillar-${pillar.id}`}
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: pillar.accent.bright,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            Pillar {pillarNumber(pillar.id)} · {pillar.label}
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
              }}
            >
              {pillar.agents.length} agents
            </span>
          </h2>
          <p
            className="t-body-sm"
            style={{
              margin: '4px 0 0',
              color: 'var(--text-muted)',
            }}
          >
            {pillar.tagline}
          </p>
        </div>
      </div>

      {/* Agent grid */}
      <div className="agents-pillar-grid">
        {pillar.agents.map((a) => (
          <AgentCard key={a.id} agent={a} accent={pillar.accent} />
        ))}
      </div>

      <style jsx>{`
        .agents-pillar-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 760px) {
          .agents-pillar-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.section>
  );
}

function pillarNumber(id) {
  return id === 'capture' ? '1' : id === 'convert' ? '2' : '3';
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------

function AgentCard({ agent, accent }) {
  const Icon = agent.icon;
  const active = agent.status === 'active';

  return (
    <motion.div
      variants={item}
      className="dark-card"
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform .15s, border-color .15s',
      }}
    >
      {/* Top row: icon + name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: accent.tint,
            border: `1px solid ${accent.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color: accent.bright }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="t-h3"
            style={{
              margin: 0,
              marginBottom: 4,
              fontSize: 15,
              letterSpacing: '-0.005em',
            }}
          >
            {agent.name}
          </div>
          {active ? (
            <ActiveBadge label="Active" dot />
          ) : (
            <PausedBadge />
          )}
        </div>
      </div>

      {/* Description */}
      <p
        className="t-body-sm"
        style={{
          margin: 0,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          minHeight: 60,
        }}
      >
        {agent.description}
      </p>

      {/* Stat pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        {agent.stats.map((s) => (
          <StatPill key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
    </motion.div>
  );
}

function StatPill({ label, value }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        fontSize: 11,
      }}
    >
      <span
        style={{
          color: 'var(--text-subtle)',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: 'var(--text-bright)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status badges
// ---------------------------------------------------------------------------

function ActiveBadge({ label = 'Active', dot = true }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: 'var(--emerald-tint)',
        color: 'var(--emerald-bright)',
        border: '1px solid rgba(16,185,129,0.3)',
      }}
    >
      {dot ? (
        <motion.span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--emerald-bright)',
            display: 'inline-block',
          }}
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      ) : null}
      {label}
    </span>
  );
}

function PausedBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: 'var(--surface-2)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--text-subtle)',
          display: 'inline-block',
        }}
      />
      Paused
    </span>
  );
}
