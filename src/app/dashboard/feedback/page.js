'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  CircleDashed,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/Button';

const OUTCOME_OPTIONS = [
  {
    id: 'acted',
    label: 'Acted on recommendation',
    description: 'Took the action Chatty suggested.',
    icon: CheckCircle2,
    color: 'var(--emerald-bright)',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.35)',
  },
  {
    id: 'ignored',
    label: 'Ignored it',
    description: 'Skipped — felt off-target or low priority.',
    icon: XCircle,
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.3)',
  },
  {
    id: 'partial',
    label: 'Partially followed',
    description: 'Took part of the advice, adapted the rest.',
    icon: CircleDashed,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'changed',
    label: 'Situation changed',
    description: 'Conditions shifted after the brief dropped.',
    icon: Sparkles,
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.3)',
  },
];

const MOCK_HISTORY = [
  {
    id: 'b-1',
    date: 'Apr 12',
    rating: 5,
    outcome: 'acted',
    comment: 'Nailed the Thompson lead call-back window.',
    delta: 0.14,
  },
  {
    id: 'b-2',
    date: 'Apr 11',
    rating: 4,
    outcome: 'partial',
    comment: 'Good call on estimate push, storm reroute was overkill.',
    delta: 0.06,
  },
  {
    id: 'b-3',
    date: 'Apr 10',
    rating: 4,
    outcome: 'acted',
    comment: null,
    delta: 0.08,
  },
  {
    id: 'b-4',
    date: 'Apr 9',
    rating: 3,
    outcome: 'ignored',
    comment: 'Ad creative suggestion didn\'t fit our brand voice.',
    delta: -0.02,
  },
  {
    id: 'b-5',
    date: 'Apr 8',
    rating: 5,
    outcome: 'acted',
    comment: 'Caught the stalled Miller quote just in time.',
    delta: 0.16,
  },
  {
    id: 'b-6',
    date: 'Apr 7',
    rating: 4,
    outcome: 'partial',
    comment: null,
    delta: 0.05,
  },
  {
    id: 'b-7',
    date: 'Apr 6',
    rating: 2,
    outcome: 'ignored',
    comment: 'Too many low-impact recommendations.',
    delta: -0.08,
  },
];

const MOCK_TREND = [
  { date: 'Mar 14', confidence: 0.62 },
  { date: 'Mar 17', confidence: 0.64 },
  { date: 'Mar 20', confidence: 0.63 },
  { date: 'Mar 23', confidence: 0.66 },
  { date: 'Mar 26', confidence: 0.7 },
  { date: 'Mar 29', confidence: 0.68 },
  { date: 'Apr 1', confidence: 0.72 },
  { date: 'Apr 4', confidence: 0.74 },
  { date: 'Apr 7', confidence: 0.71 },
  { date: 'Apr 10', confidence: 0.77 },
  { date: 'Apr 13', confidence: 0.82 },
];

function outcomeMeta(id) {
  return OUTCOME_OPTIONS.find((o) => o.id === id) ?? OUTCOME_OPTIONS[0];
}

function StarRow({ value, onChange, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            onMouseEnter={() => setHover(n)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`Rate ${n} of 5`}
          >
            <Star
              size={size}
              fill={filled ? 'var(--emerald-bright)' : 'transparent'}
              className={
                filled
                  ? 'text-[var(--emerald-bright)]'
                  : 'text-[var(--text-muted)]'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [outcomes, setOutcomes] = useState(new Set());
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function toggleOutcome(id) {
    setOutcomes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
    // Future: POST to /api/brief/{todayId} with { rating, outcomes, comment }
  }

  const avgRating =
    MOCK_HISTORY.reduce((s, h) => s + h.rating, 0) / MOCK_HISTORY.length;
  const actedCount = MOCK_HISTORY.filter((h) => h.outcome === 'acted').length;
  const trendDelta =
    MOCK_TREND[MOCK_TREND.length - 1].confidence - MOCK_TREND[0].confidence;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{
              background: 'rgba(16,185,129,0.1)',
              borderColor: 'rgba(16,185,129,0.3)',
              color: 'var(--emerald-bright)',
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-[var(--text-bright)] sm:text-3xl"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Feedback &amp; Outcomes
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Help Chatty learn from your decisions — every rating sharpens the
              next brief.
            </p>
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Avg rating · 7d',
            value: avgRating.toFixed(1),
            hint: 'out of 5',
            accent: 'emerald',
          },
          {
            label: 'Acted on',
            value: `${actedCount}/${MOCK_HISTORY.length}`,
            hint: 'last 7 briefs',
            accent: 'indigo',
          },
          {
            label: 'Confidence gain · 30d',
            value: `${trendDelta >= 0 ? '+' : ''}${(trendDelta * 100).toFixed(0)}%`,
            hint: 'from your feedback',
            accent: 'amber',
          },
        ].map((s, i) => {
          const accent =
            s.accent === 'emerald'
              ? {
                  color: 'var(--emerald-bright)',
                  bg: 'rgba(16,185,129,0.1)',
                  border: 'rgba(16,185,129,0.3)',
                }
              : s.accent === 'indigo'
                ? {
                    color: '#818cf8',
                    bg: 'rgba(99,102,241,0.1)',
                    border: 'rgba(99,102,241,0.3)',
                  }
                : {
                    color: '#fbbf24',
                    bg: 'rgba(245,158,11,0.1)',
                    border: 'rgba(245,158,11,0.3)',
                  };
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-2xl border p-4"
              style={{
                background: 'var(--surface-1)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {s.label}
                </div>
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg border"
                  style={{
                    background: accent.bg,
                    borderColor: accent.border,
                    color: accent.color,
                  }}
                >
                  <TrendingUp size={12} />
                </span>
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-bright)]">
                {s.value}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                {s.hint}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Today's brief feedback form */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Today&apos;s Brief
              </div>
              <h2 className="mt-1 text-lg font-semibold text-[var(--text-bright)]">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wider"
              style={{
                background: 'rgba(244,63,94,0.12)',
                borderColor: 'rgba(244,63,94,0.45)',
                color: '#fb7185',
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: '#fb7185' }}
              />
              HIGH PRIORITY
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Rating */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                How accurate was today&apos;s brief?
              </label>
              <div className="mt-2">
                <StarRow value={rating} onChange={setRating} />
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                What happened?
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OUTCOME_OPTIONS.map((o) => {
                  const active = outcomes.has(o.id);
                  const Icon = o.icon;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => toggleOutcome(o.id)}
                      className="flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                      style={{
                        background: active ? o.bg : 'var(--surface-2)',
                        borderColor: active ? o.border : 'var(--border)',
                      }}
                      aria-pressed={active}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-lg border"
                        style={{
                          background: active ? o.bg : 'transparent',
                          borderColor: active ? o.border : 'var(--border)',
                          color: active ? o.color : 'var(--text-muted)',
                        }}
                      >
                        <Icon size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--text-bright)]">
                          {o.label}
                        </span>
                        <span className="block text-xs text-[var(--text-muted)]">
                          {o.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="feedback-comment"
                className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]"
              >
                Anything to add?
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was spot-on, what missed the mark…"
                className="mt-2 w-full resize-none rounded-xl border p-3 text-sm text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:border-[var(--emerald-bright)] focus:outline-none"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {submitted
                  ? 'Thanks — your feedback shapes tomorrow\'s brief.'
                  : rating === 0
                    ? 'Pick a rating to submit.'
                    : `Rating: ${rating}/5 · ${outcomes.size} outcome${
                        outcomes.size === 1 ? '' : 's'
                      } selected`}
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={rating === 0 || submitted}
              >
                {submitted ? 'Sent' : 'Send feedback'}
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Confidence trend chart */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Confidence trend
              </div>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-bright)]">
                Last 30 days
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                How much the Decision Engine trusts its output, calibrated by
                your ratings.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--emerald-bright)]">
              <TrendingUp size={11} />+{(trendDelta * 100).toFixed(0)}%
            </span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={MOCK_TREND}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  domain={[0.5, 1]}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-bright)',
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${Math.round(v * 100)}%`, 'Confidence']}
                />
                <ReferenceLine
                  y={0.7}
                  stroke="var(--border-strong)"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Target',
                    fill: 'var(--text-muted)',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="url(#cg)"
                  strokeWidth={2.4}
                  dot={{
                    r: 3,
                    fill: 'var(--emerald-bright)',
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                    fill: 'var(--emerald-bright)',
                    stroke: 'var(--surface-1)',
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* History */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--surface-1)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Recent feedback
            </div>
            <h3 className="mt-1 text-lg font-semibold text-[var(--text-bright)]">
              Last 7 days
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--emerald-bright)]">
            <ArrowUpRight size={12} />
            View all
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {MOCK_HISTORY.map((h, i) => {
            const om = outcomeMeta(h.outcome);
            const OIcon = om.icon;
            return (
              <motion.li
                key={h.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.05 + i * 0.03 }}
                className="rounded-xl border p-4"
                style={{
                  background: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-bright)]">
                        {h.date}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          color: om.color,
                          background: om.bg,
                          borderColor: om.border,
                        }}
                      >
                        <OIcon size={10} />
                        {om.label}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Δ{' '}
                        <span
                          style={{
                            color:
                              h.delta >= 0 ? 'var(--emerald-bright)' : '#fb7185',
                          }}
                          className="tabular-nums font-semibold"
                        >
                          {h.delta >= 0 ? '+' : ''}
                          {(h.delta * 100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    {h.comment ? (
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        “{h.comment}”
                      </p>
                    ) : (
                      <p className="mt-1 text-xs italic text-[var(--text-muted)]">
                        No comment
                      </p>
                    )}
                  </div>
                  <div className="flex flex-none items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        fill={
                          n <= h.rating ? 'var(--emerald-bright)' : 'transparent'
                        }
                        className={
                          n <= h.rating
                            ? 'text-[var(--emerald-bright)]'
                            : 'text-[var(--text-muted)]'
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.section>
    </motion.div>
  );
}
