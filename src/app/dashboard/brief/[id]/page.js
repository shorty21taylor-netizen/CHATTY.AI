'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Brain,
  Layers3,
  FileText,
  ChevronDown,
  Zap,
  CheckCircle2,
  SkipForward,
  Sparkles,
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: {
    label: 'HIGH PRIORITY',
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.45)',
  },
  medium: {
    label: 'MEDIUM PRIORITY',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
  },
  low: {
    label: 'LOW PRIORITY',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.4)',
  },
};

const MOCK_TRACE = {
  pass_1: {
    confidence: 0.87,
    findings: [
      'Lead velocity is +28% WoW, driven by Google LSA inbound calls.',
      'Two estimates older than 72h in "quoted" status — unusual for this operator.',
      'NWS issued a severe thunderstorm watch overlapping 2 scheduled roof tear-offs.',
      'Facebook storm-season ad CPL dropped 22% vs last 7 days.',
    ],
    anomalies: [
      'Response time on inbound leads is averaging 47m — 3x the operator\'s baseline.',
    ],
  },
  pass_2: {
    confidence: 0.81,
    hypotheses: [
      'Primary bottleneck is speed-to-lead, not top-of-funnel demand.',
      'Stalled quoted estimates correlate with missed follow-up reminders.',
      'Weather is a compounding revenue risk this week.',
    ],
    framework: [
      'Rank actions on ROI × urgency × effort.',
      'Bias toward reversible, same-day actions on hot leads.',
      'Use weather data to pre-empt reschedule cost.',
    ],
  },
  pass_3: {
    confidence: 0.9,
    recommendations: [
      {
        id: 'r1',
        title: 'Call back 3 inbound leads within the hour',
        why: 'Response time drives 35% of conversion variance for this org.',
        impact: '+$12.4k expected pipeline',
        status: 'acted',
      },
      {
        id: 'r2',
        title: 'Push the Miller roof estimate from draft to sent',
        why: 'Stalled 5 days; customer actively shopping on HomeAdvisor.',
        impact: 'Recover $18.7k job at ~45% margin',
        status: 'pending',
      },
      {
        id: 'r3',
        title: 'Reroute tomorrow\'s outdoor jobs 2–4pm',
        why: 'Severe storm cell crossing the southern service zone.',
        impact: 'Avoid ~$4k rework',
        status: 'pending',
      },
      {
        id: 'r4',
        title: 'Enable the storm-season Facebook creative',
        why: 'CPL −22% and weather tailwinds persist 4–6 days.',
        impact: '~8 qualified leads at <$48 CPL',
        status: 'skipped',
      },
    ],
  },
};

const PASS_META = [
  {
    id: 'pass_1',
    title: 'Pass 1 · Signal Analysis',
    icon: Layers3,
    description:
      'Claude reads the full 24h window of signals and surfaces patterns, anomalies, and risks.',
  },
  {
    id: 'pass_2',
    title: 'Pass 2 · Pattern Recognition',
    icon: Brain,
    description:
      'Claude reasons about what the patterns mean vs. the operator\'s baseline and builds a decision framework.',
  },
  {
    id: 'pass_3',
    title: 'Pass 3 · Brief Generation',
    icon: FileText,
    description:
      'Claude drafts the ranked action list and voice summary that ships as your Daily Brief.',
  },
];

const STATUS_STYLES = {
  acted: {
    label: 'Acted on',
    icon: CheckCircle2,
    color: 'var(--emerald-bright)',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.4)',
  },
  skipped: {
    label: 'Skipped',
    icon: SkipForward,
    color: '#9ca3af',
    bg: 'rgba(255,255,255,0.04)',
    border: 'var(--border-strong)',
  },
  pending: {
    label: 'Pending',
    icon: Sparkles,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.35)',
  },
};

function PassCard({ meta, data, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = meta.icon;
  const pct = Math.round((data?.confidence ?? 0) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              background: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.3)',
              color: 'var(--emerald-bright)',
            }}
          >
            <Icon size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text-bright)]">
              {meta.title}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {meta.description}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
            style={{
              background: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.3)',
              color: 'var(--emerald-bright)',
            }}
          >
            {pct}% confidence
          </span>
          <ChevronDown
            size={16}
            className="text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: 'var(--border)' }}>
          {meta.id === 'pass_1' ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Findings
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-bright)]">
                  {data.findings.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-[var(--emerald-bright)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {data.anomalies?.length ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    Anomalies
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-bright)]">
                    {data.anomalies.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-[#fb7185]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {meta.id === 'pass_2' ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Hypotheses
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-bright)]">
                  {data.hypotheses.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-[#818cf8]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Decision framework
                </div>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
                  {data.framework.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-[var(--border-strong)]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {meta.id === 'pass_3' ? (
            <ul className="space-y-2">
              {data.recommendations.map((rec) => {
                const style =
                  STATUS_STYLES[rec.status] ?? STATUS_STYLES.pending;
                const StatusIcon = style.icon;
                return (
                  <li
                    key={rec.id}
                    className="rounded-xl border p-3"
                    style={{
                      background: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[var(--text-bright)]">
                          {rec.title}
                        </div>
                        <div className="mt-1 text-xs text-[var(--text-muted)]">
                          {rec.why}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.08)] px-2 py-1 text-xs font-semibold text-[var(--emerald-bright)]">
                          <Zap size={12} />
                          {rec.impact}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold"
                        style={{
                          color: style.color,
                          background: style.bg,
                          borderColor: style.border,
                        }}
                      >
                        <StatusIcon size={11} />
                        {style.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </motion.section>
  );
}

export default function BriefDetailPage({ params }) {
  const { id } = use(params);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/brief/${id}`);
        if (!res.ok) {
          if (!cancelled) setError(`Brief not available (${res.status})`);
          return;
        }
        const data = await res.json();
        if (!cancelled) setBrief(data.brief ?? null);
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load brief');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const priority = brief?.priority ?? 'medium';
  const priorityStyle = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;
  const trace =
    (brief?.decision_engine_trace &&
      Object.keys(brief.decision_engine_trace).length > 0 &&
      brief.decision_engine_trace) ||
    MOCK_TRACE;
  const briefDate = brief?.brief_date
    ? new Date(brief.brief_date).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Daily Brief';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Link
        href="/dashboard/brief"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--emerald-bright)]"
      >
        <ArrowLeft size={14} />
        Back to Mission Control
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Daily Brief
          </div>
          <h1
            className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-bright)] sm:text-3xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {briefDate}
          </h1>
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
            {brief?.delivered_at ? (
              <span className="text-xs text-[var(--text-muted)]">
                Delivered {new Date(brief.delivered_at).toLocaleString()}
                {brief.delivered_via ? ` · ${brief.delivered_via}` : ''}
              </span>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                {loading ? 'Loading…' : 'Not yet delivered'}
              </span>
            )}
          </div>
          {error ? (
            <div className="mt-2 text-xs text-amber-400">
              {error} — showing mock trace.
            </div>
          ) : null}
        </div>

        <button
          onClick={() => setPlaying((p) => !p)}
          className="group flex items-center gap-3 rounded-xl border px-4 py-2 text-left transition-all hover:border-[var(--emerald-bright)]"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
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
            <div className="text-sm font-semibold text-[var(--text-bright)]">
              Play full brief
            </div>
          </div>
        </button>
      </header>

      {brief?.voice_summary ? (
        <section
          className="rounded-2xl border p-6"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Voice summary transcript
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-bright)]">
            {brief.voice_summary}
          </p>
        </section>
      ) : null}

      <div className="space-y-4">
        {PASS_META.map((meta, i) => (
          <PassCard
            key={meta.id}
            meta={meta}
            data={trace[meta.id] ?? MOCK_TRACE[meta.id]}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </motion.div>
  );
}
