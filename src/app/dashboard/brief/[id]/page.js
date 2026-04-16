'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Phone,
  Pause,
  CheckCircle2,
  Send,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Cloud,
  Star,
  AlertCircle,
  Brain,
  Layers3,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock brief (single record — param id is accepted but unused for now)
// ---------------------------------------------------------------------------

const BRIEF = {
  id: 'b_042',
  date: 'Wednesday, April 15',
  time: '6:00 AM',
  priority: 'high',
  operatorName: 'Anthony',
  actions: [
    {
      rank: '01',
      icon: Phone,
      headline: 'Call Patricia Williams about the $34,200 solar proposal',
      why: 'She viewed the proposal 5 times in the last 48h — that is the single strongest intent signal in today\'s pipeline. Two competitor quotes are landing this week; delay costs the deal.',
      impact: '+$34,200 likely close',
      cta: 'Call Patricia',
      ctaColor: 'var(--primary)',
    },
    {
      rank: '02',
      icon: Pause,
      headline: 'Pause the "Solar Summer" Google Ads campaign',
      why: 'CPL rose 67% this week while conversions fell 23% — the campaign is burning $200/day and cannibalizing higher-ROI channels.',
      impact: '$1,400/wk saved, reallocate to Facebook',
      cta: 'Approve campaign pause',
      ctaColor: '#f59e0b',
    },
    {
      rank: '03',
      icon: Send,
      headline: 'Follow up on 4 ghosted bids from last month',
      why: 'The Ghosted Bid Follow-Up Agent flagged warm signals — competitor quotes expiring this week across all four. Window is short.',
      impact: '+$48K pipeline reactivation',
      cta: 'Send follow-up',
      ctaColor: '#8b5cf6',
    },
  ],
  signals: [
    { label: 'New Leads', value: '14', delta: '+22% vs avg', positive: true, icon: Users, color: 'var(--primary)' },
    { label: 'Calls Answered by AI', value: '31', delta: 'Speed-to-lead 38s avg', positive: true, icon: Phone, color: '#3b82f6' },
    { label: 'Proposals Viewed', value: '8', delta: '3 viewed 3+ times', positive: true, icon: Eye, color: '#8b5cf6' },
    { label: 'Ad Spend', value: '$340', delta: '↓12% vs yesterday', positive: true, icon: DollarSign, color: '#f59e0b' },
    { label: 'Weather', value: 'Clear', delta: 'Prime roofing conditions', positive: true, icon: Cloud, color: '#06b6d4' },
    { label: 'Review Requests Sent', value: '6', delta: '4 completed · 4.8★ avg', positive: true, icon: Star, color: '#ec4899' },
  ],
  trace: [
    {
      pass: 1,
      title: 'Signal Analysis',
      subtitle: 'What Claude noticed in the last 24h',
      confidence: 91,
      icon: Brain,
      bullets: [
        'Patricia Williams re-opened the $34,200 solar proposal 5 times between 7pm and 11pm last night — unusually dense engagement',
        '"Solar Summer" Google Ads CPL jumped from $42 to $70 while conversion rate dropped from 6.2% to 4.8% week-over-week',
        '4 dormant proposals from March crossed 30-day aging threshold; 3 show matching competitor activity in the local market',
        'Weather API shows clear skies through Saturday — first full dry window in 11 days for roofing crews',
      ],
    },
    {
      pass: 2,
      title: 'Pattern Recognition',
      subtitle: 'What it means relative to baseline',
      confidence: 87,
      icon: Layers3,
      bullets: [
        'Viewer frequency on Williams proposal (5x/48h) is 4.2σ above baseline engagement — correlates with 71% close rate historically',
        'Ad spend ROI inversion typically precedes a 3–4 week slump if not intervened; pausing now preserves ~$5,600/mo',
        'Ghosted bids with competitor-expiry overlap reactivate at 23% vs 8% baseline — these 4 are high-leverage',
        'Weather + low booked-visits ratio = operator should backfill Thu/Fri with reactivated leads rather than new ones',
      ],
    },
    {
      pass: 3,
      title: 'Brief Generation',
      subtitle: 'Why these 3 rose to the top',
      confidence: 93,
      icon: FileText,
      bullets: [
        'Ranked by expected-dollar-impact × time-decay: the Williams call decays fastest (competitor quotes land this week)',
        'The ad pause is second because it is high-leverage but not time-sensitive today — every hour of delay costs $8',
        'Ghosted bid follow-up is third because it is a batch action that agent can execute in ~15 minutes of operator attention',
        'Omitted: 2 smaller lead-response queue items — they are within Instant Lead Response agent\'s autonomous scope',
      ],
    },
  ],
};

const PRIORITY_STYLES = {
  high: { label: 'HIGH PRIORITY', color: '#f59e0b' },
  medium: { label: 'MEDIUM PRIORITY', color: '#3b82f6' },
  low: { label: 'LOW PRIORITY', color: 'var(--text-muted)' },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BriefDetailPage({ params }) {
  use(params); // consume promise in Next 15

  const [traceOpen, setTraceOpen] = useState(true);
  const [feedbackReaction, setFeedbackReaction] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const priority = PRIORITY_STYLES[BRIEF.priority];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back link */}
      <Link
        href="/dashboard/brief"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-muted)',
          fontSize: 13,
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} />
        Back to briefs
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="t-eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <FileText size={12} style={{ color: 'var(--primary)' }} />
            Daily Brief
          </div>
          <h1 className="t-h1" style={{ margin: '6px 0 6px' }}>
            Daily Brief
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span className="t-body-sm" style={{ color: 'var(--text-bright)' }}>
              {BRIEF.date} · {BRIEF.time}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                padding: '4px 10px',
                borderRadius: 999,
                background: `color-mix(in srgb, ${priority.color} 14%, transparent)`,
                color: priority.color,
              }}
            >
              <AlertCircle size={11} />
              {priority.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            color: 'var(--text-bright)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause voice summary' : 'Play voice summary'}
        </button>
      </div>

      {/* Hero quote */}
      <div
        className="dark-card"
        style={{
          padding: '28px 32px',
          marginTop: 24,
          borderLeft: '4px solid var(--primary)',
        }}
      >
        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.35,
            color: 'var(--text-bright)',
            letterSpacing: '-0.005em',
          }}
        >
          <span
            style={{
              color: 'var(--primary)',
              fontSize: 36,
              lineHeight: 0,
              verticalAlign: '-0.25em',
              marginRight: 4,
            }}
          >
            &ldquo;
          </span>
          Good morning {BRIEF.operatorName}. Here&apos;s what matters today:
        </div>
      </div>

      {/* SECTION 1 — Top 3 Actions */}
      <div style={{ marginTop: 36 }}>
        <div
          className="t-eyebrow"
          style={{ marginBottom: 16, color: 'var(--primary)' }}
        >
          TOP 3 ACTIONS TODAY
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {BRIEF.actions.map((a) => (
            <ActionCard key={a.rank} a={a} />
          ))}
        </div>
      </div>

      {/* SECTION 2 — Signal Summary */}
      <div style={{ marginTop: 40 }}>
        <div className="t-eyebrow" style={{ marginBottom: 16 }}>
          SIGNAL SUMMARY
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
          className="signal-grid"
        >
          {BRIEF.signals.map((s) => (
            <SignalTile key={s.label} s={s} />
          ))}
        </div>
      </div>

      {/* SECTION 3 — Decision Engine Trace */}
      <div style={{ marginTop: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div className="t-eyebrow">DECISION ENGINE TRACE</div>
          <button
            type="button"
            onClick={() => setTraceOpen((o) => !o)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--primary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {traceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {traceOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {traceOpen ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {BRIEF.trace.map((t) => (
              <TracePass key={t.pass} t={t} />
            ))}
          </div>
        ) : (
          <div
            className="dark-card"
            style={{
              padding: 16,
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            3 passes · hidden
          </div>
        )}
      </div>

      {/* Footer — feedback */}
      <div
        className="dark-card"
        style={{ padding: 24, marginTop: 40, marginBottom: 40 }}
      >
        <h3 className="t-h3" style={{ margin: 0 }}>
          How useful was this brief?
        </h3>
        <p className="t-body-sm" style={{ marginTop: 4 }}>
          Your feedback shapes tomorrow&apos;s priorities — the decision engine
          learns from every reaction.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          {[
            { k: 'love', emoji: '😍', label: 'Nailed it' },
            { k: 'useful', emoji: '👍', label: 'Useful' },
            { k: 'ok', emoji: '😐', label: 'Okay' },
            { k: 'off', emoji: '👎', label: 'Off base' },
            { k: 'bad', emoji: '🤦', label: 'Missed it' },
          ].map((r) => {
            const active = feedbackReaction === r.k;
            return (
              <button
                key={r.k}
                type="button"
                onClick={() => setFeedbackReaction(r.k)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: active
                    ? 'var(--primary-tint)'
                    : 'var(--surface-2)',
                  border: active
                    ? '1px solid rgba(16,185,129,0.4)'
                    : '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: active ? 'var(--primary)' : 'var(--text-bright)',
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{r.emoji}</span>
                {r.label}
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="What could be sharper? (optional)"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          style={{
            marginTop: 14,
            width: '100%',
            minHeight: 80,
            resize: 'vertical',
            padding: 12,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--input-bg)',
            color: 'var(--text-bright)',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        />

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span className="t-body-sm" style={{ color: 'var(--text-subtle)' }}>
            {feedbackSubmitted
              ? 'Thanks — feedback logged.'
              : 'Feedback is private to your org.'}
          </span>
          <button
            type="button"
            className="btn-primary"
            disabled={!feedbackReaction && !feedbackText.trim()}
            onClick={() => {
              setFeedbackSubmitted(true);
            }}
            style={{
              opacity:
                feedbackReaction || feedbackText.trim() ? 1 : 0.5,
            }}
          >
            <CheckCircle2 size={14} />
            Submit Feedback
          </button>
        </div>
      </div>

      {/* Responsive */}
      <style jsx>{`
        @media (max-width: 900px) {
          :global(.signal-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          :global(.signal-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action card (Top 3)
// ---------------------------------------------------------------------------

function ActionCard({ a }) {
  const Icon = a.icon;
  return (
    <div
      className="dark-card"
      style={{
        padding: 22,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 18,
        alignItems: 'flex-start',
      }}
    >
      {/* Rank */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: 'var(--border-strong, var(--border))',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          minWidth: 48,
        }}
      >
        {a.rank}
      </div>

      {/* Body */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              background: `color-mix(in srgb, ${a.ctaColor} 14%, transparent)`,
              color: a.ctaColor,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={13} />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Recommended Action
          </span>
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text-bright)',
            lineHeight: 1.3,
          }}
        >
          {a.headline}
        </div>
        <p
          className="t-body-sm"
          style={{ marginTop: 8, marginBottom: 10, lineHeight: 1.5 }}
        >
          <span
            style={{
              fontWeight: 700,
              color: 'var(--text-bright)',
              marginRight: 4,
            }}
          >
            Why:
          </span>
          {a.why}
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'var(--primary-tint)',
            color: 'var(--primary)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <TrendingUp size={12} />
          {a.impact}
        </div>
      </div>

      {/* CTA */}
      <div>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            background: a.ctaColor,
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {a.cta}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signal tile
// ---------------------------------------------------------------------------

function SignalTile({ s }) {
  const Icon = s.icon;
  return (
    <div className="dark-card" style={{ padding: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          {s.label}
        </span>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
            color: s.color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={13} />
        </div>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {s.value}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: 600,
          color: s.positive ? 'var(--primary)' : 'var(--negative)',
        }}
      >
        {s.delta}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trace pass card
// ---------------------------------------------------------------------------

function TracePass({ t }) {
  const Icon = t.icon;
  return (
    <div className="dark-card" style={{ padding: 22 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                'color-mix(in srgb, var(--primary) 14%, transparent)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Pass {t.pass}
            </div>
            <h3
              className="t-h3"
              style={{ margin: '2px 0 0', color: 'var(--text-bright)' }}
            >
              {t.title}
            </h3>
            <div className="t-body-sm" style={{ marginTop: 2 }}>
              {t.subtitle}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Confidence
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--primary)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {t.confidence}%
          </div>
        </div>
      </div>

      <ul
        style={{
          margin: '8px 0 0',
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {t.bullets.map((b, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--text-bright)',
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--primary)',
                marginTop: 9,
                flexShrink: 0,
              }}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
