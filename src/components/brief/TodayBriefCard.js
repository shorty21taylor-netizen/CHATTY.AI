'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  CheckCircle2,
  SkipForward,
  Zap,
  ChevronDown,
  Sparkles,
  Brain,
  Layers3,
  FileText,
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: {
    label: 'HIGH PRIORITY',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.45)',
    color: '#fb7185',
  },
  medium: {
    label: 'MEDIUM PRIORITY',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
    color: '#fbbf24',
  },
  low: {
    label: 'LOW PRIORITY',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.4)',
    color: '#818cf8',
  },
};

const MOCK_ACTIONS = [
  {
    id: 'a1',
    title: 'Call back 3 inbound leads within the hour',
    why: 'Response time matters more than any other factor — 3 hot leads from Google LSA have been waiting 4h+. Probability of conversion drops 35% every additional hour.',
    impact: '+$12.4k pipeline if all 3 book an inspection',
  },
  {
    id: 'a2',
    title: 'Push the Miller roof estimate to "sent" today',
    why: 'Estimate has been in draft for 5 days — Miller asked for a revised quote on Tuesday and is actively shopping competitors on HomeAdvisor.',
    impact: 'Recover $18.7k job at ~45% margin',
  },
  {
    id: 'a3',
    title: 'Reroute tomorrow\'s install — severe storm cell at 2–4pm',
    why: 'NWS is tracking a line of storms across the southern service area. Your Thompson and Patel jobs are both outdoor roof tear-offs.',
    impact: 'Avoid ~$4k in rework + one unhappy review',
  },
  {
    id: 'a4',
    title: 'Run the Facebook "storm-season" ad creative',
    why: 'Your cost-per-lead on storm-targeted ads dropped 22% this week — and weather tailwinds will keep demand high for 4–6 days.',
    impact: '~8 additional qualified leads at <$48 CPL',
  },
];

const TRACE = [
  {
    id: 'pass1',
    title: 'Pass 1 · Signal Analysis',
    icon: Layers3,
    confidence: 0.87,
    summary:
      'Identified 3 hot lead clusters, 2 stalled estimates, 1 weather risk zone, and 4 high-performing ad creatives.',
    bullets: [
      'Lead velocity is +28% WoW — driven by Google LSA.',
      '2 estimates older than 72h in "quoted" status (unusual for this org).',
      'Severe thunderstorm watch overlaps 2 scheduled jobs.',
      'Facebook CPL trending down sharply since Sunday.',
    ],
  },
  {
    id: 'pass2',
    title: 'Pass 2 · Pattern Recognition',
    icon: Brain,
    confidence: 0.81,
    summary:
      'Primary bottleneck is speed-to-lead, not top-of-funnel. Weather is a compounding risk on revenue this week.',
    bullets: [
      'Historically this operator wins 62% of <15m response vs. 19% of >4h.',
      'Storm-season ad performance tends to peak 48–72h before a front.',
      'Stalled estimates in "quoted" > 72h have an 11% close rate.',
    ],
  },
  {
    id: 'pass3',
    title: 'Pass 3 · Brief Generation',
    icon: FileText,
    confidence: 0.9,
    summary:
      'Produced 4 ranked actions weighted on ROI × urgency × effort. Voice summary rendered with ElevenLabs.',
    bullets: [
      'Call-back sprint (ROI: very high, effort: low).',
      'Miller estimate push (ROI: high, effort: low).',
      'Reroute storm jobs (ROI: medium, urgency: critical).',
      'Enable storm ad creative (ROI: medium, effort: low).',
    ],
  },
];

function StatusChip({ value, active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all"
      style={{
        background: active ? color.bg : 'transparent',
        borderColor: active ? color.border : 'var(--border)',
        color: active ? color.text : 'var(--text-muted)',
      }}
      aria-pressed={active}
      aria-label={`Mark as ${value}`}
    >
      {children}
    </button>
  );
}

export default function TodayBriefCard({ brief }) {
  const priority = brief?.priority ?? 'high';
  const priorityStyle = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;
  const deliveredAt = brief?.delivered_at
    ? new Date(brief.delivered_at)
    : null;
  const deliveredLabel = deliveredAt
    ? `Delivered ${deliveredAt.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : 'Generating…';
  const briefDate = brief?.brief_date
    ? new Date(brief.brief_date).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

  const [statuses, setStatuses] = useState(() =>
    MOCK_ACTIONS.reduce((acc, a) => ({ ...acc, [a.id]: null }), {})
  );
  const [playing, setPlaying] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  function setStatus(id, value) {
    setStatuses((s) => ({ ...s, [id]: s[id] === value ? null : value }));
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl border"
      style={{
        background:
          'linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2) 100%)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Emerald gradient left border */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background:
            'linear-gradient(180deg, var(--emerald-bright) 0%, rgba(16,185,129,0.2) 100%)',
          boxShadow: '0 0 28px rgba(16,185,129,0.35)',
        }}
      />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              <Sparkles size={14} className="text-[var(--emerald-bright)]" />
              Today&apos;s Brief
            </div>
            <h2
              className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-bright)] sm:text-3xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {briefDate}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wider"
                style={{
                  background: priorityStyle.bg,
                  borderColor: priorityStyle.border,
                  color: priorityStyle.color,
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: priorityStyle.color }}
                />
                {priorityStyle.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: deliveredAt
                      ? 'var(--emerald-bright)'
                      : '#fbbf24',
                    boxShadow: deliveredAt
                      ? '0 0 6px rgba(16,185,129,0.8)'
                      : '0 0 6px rgba(251,191,36,0.6)',
                  }}
                />
                {deliveredLabel}
              </span>
            </div>
          </div>

          {/* Voice play */}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="group flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all hover:border-[var(--emerald-bright)]"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-white"
              style={{
                background:
                  'linear-gradient(135deg, var(--emerald-bright), #059669)',
                boxShadow: '0 0 14px rgba(16,185,129,0.4)',
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} fill="white" />}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Voice summary
              </div>
              <div className="mt-0.5 flex items-end gap-0.5" aria-hidden>
                {[4, 8, 12, 16, 12, 20, 14, 9, 18, 6, 14, 10].map((h, i) => (
                  <span
                    key={i}
                    className="block w-[3px] rounded-full"
                    style={{
                      height: h,
                      background: playing
                        ? 'var(--emerald-bright)'
                        : 'var(--border-strong)',
                      opacity: playing ? 1 : 0.7,
                      transition: 'all .2s',
                      animation: playing
                        ? `wave 1s ${i * 0.08}s ease-in-out infinite`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Action items */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          {MOCK_ACTIONS.map((action, i) => {
            const status = statuses[action.id];
            return (
              <motion.article
                key={action.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.1 + i * 0.06 }}
                className="rounded-xl border p-4 transition-colors"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  opacity: status === 'skip' ? 0.5 : 1,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div
                      className={`font-semibold text-[var(--text-bright)] ${
                        status === 'done' ? 'line-through' : ''
                      }`}
                    >
                      {action.title}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {action.why}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-2 py-1 text-xs font-semibold text-[var(--emerald-bright)]">
                      <Zap size={12} />
                      {action.impact}
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-1.5">
                    <StatusChip
                      value="act"
                      active={status === 'act'}
                      onClick={() => setStatus(action.id, 'act')}
                      color={{
                        bg: 'rgba(16,185,129,0.12)',
                        border: 'rgba(16,185,129,0.4)',
                        text: 'var(--emerald-bright)',
                      }}
                    >
                      Act on it
                    </StatusChip>
                    <StatusChip
                      value="skip"
                      active={status === 'skip'}
                      onClick={() => setStatus(action.id, 'skip')}
                      color={{
                        bg: 'rgba(255,255,255,0.04)',
                        border: 'var(--border-strong)',
                        text: 'var(--text-muted)',
                      }}
                    >
                      <SkipForward size={11} className="-mt-0.5 inline" /> Skip
                    </StatusChip>
                    <StatusChip
                      value="done"
                      active={status === 'done'}
                      onClick={() => setStatus(action.id, 'done')}
                      color={{
                        bg: 'rgba(99,102,241,0.12)',
                        border: 'rgba(99,102,241,0.4)',
                        text: '#818cf8',
                      }}
                    >
                      <CheckCircle2 size={11} className="-mt-0.5 inline" /> Done
                    </StatusChip>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Decision Engine trace */}
        <div className="mt-6">
          <button
            onClick={() => setTraceOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:border-[var(--emerald-bright)]"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
            aria-expanded={traceOpen}
          >
            <div className="flex items-center gap-2">
              <Brain size={15} className="text-[var(--emerald-bright)]" />
              <span className="text-sm font-semibold text-[var(--text-bright)]">
                Decision Engine reasoning
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                · 3-pass Claude chain
              </span>
            </div>
            <ChevronDown
              size={16}
              className="text-[var(--text-muted)] transition-transform"
              style={{
                transform: traceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {traceOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25 }}
              className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3"
            >
              {TRACE.map((pass) => {
                const Icon = pass.icon;
                const pct = Math.round(pass.confidence * 100);
                return (
                  <div
                    key={pass.id}
                    className="rounded-xl border p-4"
                    style={{
                      background: 'var(--surface-3, var(--surface-2))',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={14}
                          className="text-[var(--emerald-bright)]"
                        />
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                          {pass.title}
                        </span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-[var(--emerald-bright)]">
                        {pct}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--text-bright)]">
                      {pass.summary}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-muted)]">
                      {pass.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 inline-block h-1 w-1 flex-none rounded-full bg-[var(--emerald-bright)]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </motion.section>
  );
}
