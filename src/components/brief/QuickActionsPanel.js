'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  History,
  Send,
  PlugZap,
} from 'lucide-react';

const MOCK_RECENT = [
  { id: 'b-today', label: 'Today · Apr 13', priority: 'high' },
  { id: 'b-1', label: 'Yesterday · Apr 12', priority: 'medium' },
  { id: 'b-2', label: 'Sat · Apr 11', priority: 'medium' },
  { id: 'b-3', label: 'Fri · Apr 10', priority: 'low' },
  { id: 'b-4', label: 'Thu · Apr 9', priority: 'high' },
  { id: 'b-5', label: 'Wed · Apr 8', priority: 'medium' },
  { id: 'b-6', label: 'Tue · Apr 7', priority: 'low' },
];

const MOCK_SOURCES = [
  { id: 'crm', label: 'Built-in CRM', status: 'live' },
  { id: 'twilio', label: 'Twilio · voice + SMS', status: 'live' },
  { id: 'google', label: 'Google Ads', status: 'live' },
  { id: 'facebook', label: 'Facebook Ads', status: 'live' },
  { id: 'weather', label: 'Weather · NWS', status: 'live' },
  { id: 'gmail', label: 'Gmail', status: 'idle' },
];

const PRIORITY_COLOR = {
  high: '#fb7185',
  medium: '#fbbf24',
  low: '#818cf8',
};

function Card({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border p-5"
      style={{
        background: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      {children}
    </motion.div>
  );
}

export default function QuickActionsPanel({ recentBriefs }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const briefs =
    recentBriefs && recentBriefs.length > 0
      ? recentBriefs.slice(0, 7).map((b) => ({
          id: b.id,
          label: new Date(b.brief_date).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          priority: b.priority ?? 'medium',
        }))
      : MOCK_RECENT;

  return (
    <aside className="space-y-4">
      {/* Ask Chatty */}
      <Card delay={0}>
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-[var(--emerald-bright)]" />
          <h3 className="font-semibold text-[var(--text-bright)]">Ask Chatty</h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Ask a question about today&apos;s signals or pipeline.
        </p>
        <button
          className="mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--emerald-bright)] hover:text-[var(--text-bright)]"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <span>Why are we losing quotes this week?</span>
          <Send size={13} className="text-[var(--emerald-bright)]" />
        </button>
      </Card>

      {/* Recent briefs */}
      <Card delay={0.05}>
        <div className="flex items-center gap-2">
          <History size={15} className="text-[var(--emerald-bright)]" />
          <h3 className="font-semibold text-[var(--text-bright)]">
            Recent briefs
          </h3>
        </div>
        <ul className="mt-3 space-y-1">
          {briefs.map((b, i) => (
            <li key={b.id}>
              <Link
                href={b.id === 'b-today' ? '/dashboard/brief' : `/dashboard/brief/${b.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-bright)]"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      background: PRIORITY_COLOR[b.priority] ?? '#fbbf24',
                    }}
                  />
                  {b.label}
                </span>
                {i === 0 ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--emerald-bright)]">
                    Today
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* Feedback */}
      <Card delay={0.1}>
        <div className="flex items-center gap-2">
          <Star size={15} className="text-[var(--emerald-bright)]" />
          <h3 className="font-semibold text-[var(--text-bright)]">
            Brief feedback
          </h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          How accurate was today&apos;s brief?
        </p>
        <div
          className="mt-3 flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hover || rating);
            return (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
                className="p-1 transition-transform hover:scale-110"
                aria-label={`Rate ${n} of 5`}
              >
                <Star
                  size={20}
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
        <textarea
          rows={2}
          placeholder="Anything off today?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-2 w-full resize-none rounded-xl border bg-[var(--surface-2)] p-2 text-sm text-[var(--text-bright)] placeholder:text-[var(--text-muted)] focus:border-[var(--emerald-bright)] focus:outline-none"
          style={{ borderColor: 'var(--border)' }}
        />
        <button
          disabled={rating === 0 || submitted}
          onClick={() => setSubmitted(true)}
          className="mt-2 w-full rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background:
              'linear-gradient(135deg, var(--emerald-bright), #059669)',
            boxShadow:
              rating > 0 && !submitted
                ? '0 0 14px rgba(16,185,129,0.35)'
                : 'none',
          }}
        >
          {submitted ? 'Thanks — logged' : 'Send feedback'}
        </button>
      </Card>

      {/* Source status */}
      <Card delay={0.15}>
        <div className="flex items-center gap-2">
          <PlugZap size={15} className="text-[var(--emerald-bright)]" />
          <h3 className="font-semibold text-[var(--text-bright)]">
            Signal sources
          </h3>
        </div>
        <ul className="mt-3 space-y-2">
          {MOCK_SOURCES.map((s) => {
            const live = s.status === 'live';
            return (
              <li
                key={s.id}
                className="flex items-center justify-between text-sm text-[var(--text-bright)]"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      background: live ? 'var(--emerald-bright)' : '#6b7280',
                      boxShadow: live
                        ? '0 0 8px rgba(16,185,129,0.7)'
                        : 'none',
                    }}
                  />
                  {s.label}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {s.status}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </aside>
  );
}
