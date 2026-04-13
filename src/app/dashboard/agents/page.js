'use client';

import {
  MessageCircle,
  Zap,
  FileText,
  MessageSquare,
  FileCheck,
  Calendar,
  Shield,
  Star,
  RotateCcw,
  Send,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Agent data
// ---------------------------------------------------------------------------

const PILLARS = [
  {
    id: 'capture',
    label: 'CAPTURE',
    accent: 'emerald',
    agents: [
      {
        id: 'instant-lead-response',
        name: 'Instant Lead Response',
        icon: Zap,
        status: 'active',
        description: 'Responds to new leads in under 5 seconds via SMS',
        stats: [
          { label: 'Avg Response', value: '4.2s' },
          { label: 'Leads Handled', value: '847' },
          { label: 'Conversion', value: '34%' },
        ],
      },
      {
        id: 'form-bot',
        name: 'Form Bot',
        icon: FileText,
        status: 'active',
        description: 'Captures and qualifies web form submissions instantly',
        stats: [
          { label: 'Forms Processed', value: '1,203' },
          { label: 'Qualified', value: '67%' },
          { label: 'Response Time', value: '1.1s' },
        ],
      },
      {
        id: 'social-dm-agent',
        name: 'Social DM Agent',
        icon: MessageSquare,
        status: 'active',
        description: 'Monitors and replies to Facebook/Instagram DMs',
        stats: [
          { label: 'DMs Handled', value: '312' },
          { label: 'Reply Rate', value: '98%' },
          { label: 'Avg Time', value: '8s' },
        ],
      },
    ],
  },
  {
    id: 'convert',
    label: 'CONVERT',
    accent: 'indigo',
    agents: [
      {
        id: 'quote-follow-up',
        name: 'Quote Follow-Up',
        icon: FileCheck,
        status: 'active',
        description: 'Follows up on sent quotes until they close or decline',
        stats: [
          { label: 'Quotes Tracked', value: '156' },
          { label: 'Follow-ups Sent', value: '423' },
          { label: 'Close Rate', value: '41%' },
        ],
      },
      {
        id: 'appointment-setter',
        name: 'Appointment Setter',
        icon: Calendar,
        status: 'active',
        description: 'Books inspections and consultations automatically',
        stats: [
          { label: 'Booked Today', value: '8' },
          { label: 'This Week', value: '31' },
          { label: 'Show Rate', value: '89%' },
        ],
      },
      {
        id: 'objection-handler',
        name: 'Objection Handler',
        icon: Shield,
        status: 'active',
        description: 'Handles common objections with proven responses',
        stats: [
          { label: 'Objections Resolved', value: '234' },
          { label: 'Win Rate', value: '62%' },
          { label: 'Avg Touches', value: '2.3' },
        ],
      },
      {
        id: 'review-request',
        name: 'Review Request',
        icon: Star,
        status: 'active',
        description: 'Asks happy customers for Google/Yelp reviews',
        stats: [
          { label: 'Requests Sent', value: '189' },
          { label: 'Reviews Received', value: '94' },
          { label: 'Avg Rating', value: '4.8' },
        ],
      },
    ],
  },
  {
    id: 'reclaim',
    label: 'RECLAIM',
    accent: 'amber',
    agents: [
      {
        id: 'dead-lead-reactivation',
        name: 'Dead Lead Reactivation',
        icon: RotateCcw,
        status: 'active',
        description: 'Re-engages cold leads with personalized outreach',
        stats: [
          { label: 'Leads Revived', value: '67' },
          { label: 'Reactivation Rate', value: '12%' },
          { label: 'Revenue', value: '$34K' },
        ],
      },
      {
        id: 'ghosted-bid-follow-up',
        name: 'Ghosted Bid Follow-Up',
        icon: Send,
        status: 'active',
        description: 'Follows up on proposals that went silent',
        stats: [
          { label: 'Bids Tracked', value: '89' },
          { label: 'Responses', value: '31' },
          { label: 'Recovered', value: '$128K' },
        ],
      },
      {
        id: 'past-customer-reengagement',
        name: 'Past Customer Re-engagement',
        icon: Users,
        status: 'active',
        description: 'Reaches out to past customers for repeat business',
        stats: [
          { label: 'Contacted', value: '234' },
          { label: 'Rebooked', value: '18%' },
          { label: 'Revenue', value: '$67K' },
        ],
      },
    ],
  },
];

// Tailwind does not allow fully dynamic class names, so we map accent
// keys to the concrete classes we need. Every class below is referenced
// literally here, which keeps Tailwind's JIT happy.
const ACCENT = {
  emerald: {
    text: 'text-emerald-600',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    leftBorder: 'border-l-emerald-500',
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
  },
  indigo: {
    text: 'text-indigo-600',
    bgSoft: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    leftBorder: 'border-l-indigo-500',
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-500/10',
  },
  amber: {
    text: 'text-amber-600',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    leftBorder: 'border-l-amber-500',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  return (
    <div className="text-zinc-900">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            AI Agents
          </h1>
          <p className="text-sm text-zinc-500 sm:text-base">
            Your autonomous workforce — 10 agents, 3 pillars, full funnel coverage
          </p>
        </header>

        {/* Telegram EA Hero */}
        <TelegramHero />

        {/* Pillars */}
        <div className="space-y-10">
          {PILLARS.map((pillar) => (
            <PillarSection key={pillar.id} pillar={pillar} />
          ))}
        </div>

        {/* Create Custom Agent */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Plus size={16} />
            Create Custom Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Telegram EA hero card
// ---------------------------------------------------------------------------

function TelegramHero() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-500/60 to-indigo-500 p-[1.5px] shadow-sm">
      <div className="rounded-2xl bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: icon + text */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 shadow-lg shadow-emerald-500/20">
              <MessageCircle size={26} className="text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                  Your Executive Assistant
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-500/30">
                  Premium
                </span>
              </div>
              <p className="text-sm text-zinc-500 sm:text-base">
                Message on Telegram anytime — ask anything about your business today
              </p>
            </div>
          </div>

          {/* Right: stats + CTA */}
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <HeroStat label="Messages Today" value="12" />
              <HeroStat label="Avg Response" value="<2s" />
              <HeroStat label="Uptime" value="99.9%" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
            >
              Message on Telegram
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
      <span className="text-[11px] font-medium text-zinc-500">{label}:</span>
      <span className="text-[13px] font-bold text-zinc-900 tabular-nums">
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pillar section
// ---------------------------------------------------------------------------

function PillarSection({ pillar }) {
  const accent = ACCENT[pillar.accent];

  return (
    <section className="space-y-4">
      {/* Pillar header: colored left border + pillar name in that color */}
      <div
        className={`border-l-4 ${accent.leftBorder} pl-4`}
      >
        <h2
          className={`text-sm font-bold uppercase tracking-[0.2em] ${accent.text}`}
        >
          {pillar.label}
        </h2>
      </div>

      {/* 2-column grid of agent cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {pillar.agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} accent={accent} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------

function AgentCard({ agent, accent }) {
  const Icon = agent.icon;
  const isActive = agent.status === 'active';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
      {/* Top row: icon + name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent.iconBg} ring-1 ring-inset ${accent.border}`}
          >
            <Icon size={18} className={accent.icon} />
          </div>
          <h3 className="truncate text-[15px] font-semibold text-zinc-900">
            {agent.name}
          </h3>
        </div>
        {isActive ? <ActiveBadge /> : <PausedBadge />}
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-500">{agent.description}</p>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {agent.stats.map((s) => (
          <StatPill key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px]">
      <span className="text-zinc-500">{label}:</span>
      <span className="font-semibold text-zinc-900 tabular-nums">{value}</span>
    </span>
  );
}

function ActiveBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  );
}

function PausedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 ring-1 ring-inset ring-zinc-200">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Paused
    </span>
  );
}
