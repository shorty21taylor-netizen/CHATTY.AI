'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Inbox,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from 'lucide-react';

const STAT_CARDS = [
  {
    icon: MessageSquare,
    label: 'Briefs Delivered',
    value: '14',
    hint: 'Last 14 days',
  },
  {
    icon: CheckCircle2,
    label: 'Briefs Acted On',
    value: '12 / 86%',
    hint: '2 ignored',
    accent: true,
  },
  {
    icon: TrendingUp,
    label: 'Avg Confidence Delta',
    value: '+0.4',
    hint: 'Engine is calibrating well',
  },
  {
    icon: Inbox,
    label: 'Open Feedback',
    value: '3',
    hint: 'Awaiting your review',
  },
];

const BRIEF_HISTORY = [
  {
    date: '2026-04-15',
    title: 'Patricia Williams is ready to close',
    status: 'acted',
    reaction: 'love',
    confidence: 0.93,
  },
  {
    date: '2026-04-14',
    title: 'Pause Solar Summer ads — lead quality dropped',
    status: 'acted',
    reaction: 'good',
    confidence: 0.87,
  },
  {
    date: '2026-04-13',
    title: 'Follow up on 7 ghosted bids over $12k',
    status: 'acted',
    reaction: 'good',
    confidence: 0.91,
  },
  {
    date: '2026-04-12',
    title: 'Reactivate 18 dead HVAC leads from Q4',
    status: 'open',
    reaction: null,
    confidence: 0.78,
  },
  {
    date: '2026-04-11',
    title: 'Call Marcus Miller — 3 touchpoints, no reply',
    status: 'acted',
    reaction: 'neutral',
    confidence: 0.69,
  },
  {
    date: '2026-04-10',
    title: 'Push Google Ads budget on Tuesdays',
    status: 'ignored',
    reaction: 'bad',
    confidence: 0.72,
  },
  {
    date: '2026-04-09',
    title: 'Send review requests to 9 recent wins',
    status: 'acted',
    reaction: 'love',
    confidence: 0.95,
  },
  {
    date: '2026-04-08',
    title: 'James Rodriguez asked for revised quote',
    status: 'open',
    reaction: null,
    confidence: 0.84,
  },
  {
    date: '2026-04-07',
    title: 'Check weather — storm routing opportunity',
    status: 'acted',
    reaction: 'good',
    confidence: 0.88,
  },
  {
    date: '2026-04-06',
    title: 'Upsell maintenance plan to 4 HVAC customers',
    status: 'open',
    reaction: null,
    confidence: 0.81,
  },
];

const OPEN_FEEDBACK = [
  {
    date: '2026-04-12',
    title: 'Reactivate 18 dead HVAC leads from Q4',
    preview:
      'The engine flagged 18 leads last touched 90+ days ago. Dead Lead Reactivation can start a drip today.',
    confidence: 0.78,
  },
  {
    date: '2026-04-08',
    title: 'James Rodriguez asked for revised quote',
    preview:
      'James responded to Quote Follow-Up asking for a lower price. Objection Handler is standing by with 3 scripts.',
    confidence: 0.84,
  },
  {
    date: '2026-04-06',
    title: 'Upsell maintenance plan to 4 HVAC customers',
    preview:
      'Past Customer Re-engagement has 4 one-year-old installs ready for a maintenance pitch — avg ticket $380.',
    confidence: 0.81,
  },
];

const SIGNAL_BULLETS = [
  'You act on 86% of briefs — well above the 62% Chatty baseline.',
  'Your strongest reactions go to proposals > $8k. The engine is weighting those higher.',
  'You ignore "paid ads" recommendations on Mondays. Engine has de-prioritized them.',
  'Confidence has drifted +0.4 over the last 14 days — calibration is improving.',
  'Three open briefs are stale by > 48h. Silence is data, but a thumb up/down is better.',
];

const REACTION_MAP = {
  love: { emoji: '😍', color: 'var(--primary)' },
  good: { emoji: '👍', color: '#3b82f6' },
  neutral: { emoji: '😐', color: 'var(--text-muted)' },
  bad: { emoji: '👎', color: '#f59e0b' },
  fail: { emoji: '🤦', color: 'var(--negative)' },
};

const STATUS_MAP = {
  acted: { label: 'ACTED', color: 'var(--primary)' },
  open: { label: 'OPEN', color: '#f59e0b' },
  ignored: { label: 'IGNORED', color: 'var(--text-muted)' },
};

function Pill({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        borderRadius: 999,
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, hint, accent }) {
  const Icon = icon;
  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: accent ? '0 0 24px rgba(16,185,129,0.12)' : 'none',
        borderColor: accent
          ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
          : 'var(--border)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 6,
            background: accent
              ? 'color-mix(in srgb, var(--primary) 14%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
            color: accent ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          <Icon size={13} />
        </span>
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: accent ? 'var(--primary)' : 'var(--text-bright)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</div>
    </div>
  );
}

export default function FeedbackPage() {
  const [openReactions, setOpenReactions] = useState({});
  const [draft, setDraft] = useState({});
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    fetch('/api/briefs/confidence')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setConfidence(data))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Header */}
      <div>
        <div className="t-eyebrow">Feedback loop</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Your feedback trains Chatty
        </h1>
        <p className="t-body-sm" style={{ margin: 0 }}>
          Every reaction updates the Decision Engine's confidence model.
        </p>
      </div>

      {/* Stats */}
      <div
        className="feedback-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 28,
        }}
      >
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Category Confidence Breakdown */}
      {confidence && confidence.categories.length > 0 && (
        <div className="dark-card" style={{ padding: 20, marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Per-Category Accuracy (90 days)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {confidence.categories.map((cat) => (
              <div key={cat.category} style={{ padding: 12, borderRadius: 8, background: 'rgba(15,23,42,0.5)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)', textTransform: 'capitalize', marginBottom: 8 }}>
                  {cat.category.replace(/_/g, ' ')}
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'rgba(100,116,139,0.2)' }}>
                  <div style={{ width: `${cat.helpfulPct}%`, background: '#10b981' }} />
                  <div style={{ width: `${cat.noopPct}%`, background: '#94a3b8' }} />
                  <div style={{ width: `${cat.harmfulPct}%`, background: '#ef4444' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4, color: 'var(--text-muted)' }}>
                  <span style={{ color: '#10b981' }}>{cat.helpfulPct}% helpful</span>
                  <span style={{ color: '#ef4444' }}>{cat.harmfulPct}% harmful</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {cat.totalFeedback} reviews
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-pane: Brief history + Your Feedback Signal */}
      <div
        className="feedback-two-pane"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          marginTop: 28,
        }}
      >
        <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Brief history
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              The last 10 daily briefs and how you reacted to them.
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Date</th>
                  <th>Brief</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Confidence</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Reaction</th>
                  <th style={{ textAlign: 'right', width: 110 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {BRIEF_HISTORY.map((b) => {
                  const reaction = b.reaction ? REACTION_MAP[b.reaction] : null;
                  const status = STATUS_MAP[b.status];
                  return (
                    <tr key={b.date}>
                      <td
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {b.date}
                      </td>
                      <td
                        style={{
                          color: 'var(--text-bright)',
                          fontWeight: 500,
                        }}
                      >
                        {b.title}
                      </td>
                      <td
                        style={{
                          textAlign: 'center',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {b.confidence.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 18 }}>
                        {reaction ? (
                          <span title={b.reaction}>{reaction.emoji}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Pill color={status.color}>{status.label}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dark-card" style={{ padding: 20 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--primary)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <Sparkles size={13} />
            Your feedback signal
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginTop: 10,
            }}
          >
            What Chatty has learned about you
          </div>
          <ul
            style={{
              margin: '14px 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {SIGNAL_BULLETS.map((b, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--text-body)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    marginTop: 7,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    flexShrink: 0,
                  }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Open feedback cards */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Open feedback
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          React below so the Decision Engine can recalibrate.
        </div>
        <div
          className="feedback-open-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {OPEN_FEEDBACK.map((b) => (
            <div
              key={b.date}
              className="dark-card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
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
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {b.date}
                </span>
                <Pill color="#f59e0b">OPEN</Pill>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-bright)',
                  lineHeight: 1.35,
                }}
              >
                {b.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                }}
              >
                {b.preview}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                Confidence
                <span
                  style={{
                    color: 'var(--text-bright)',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {b.confidence.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginTop: 'auto',
                  paddingTop: 4,
                }}
              >
                {Object.entries(REACTION_MAP).map(([k, r]) => {
                  const active = openReactions[b.date] === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        setOpenReactions((s) => ({ ...s, [b.date]: k }))
                      }
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        fontSize: 16,
                        borderRadius: 8,
                        border: `1px solid ${
                          active ? r.color : 'var(--border)'
                        }`,
                        background: active
                          ? `color-mix(in srgb, ${r.color} 14%, transparent)`
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 120ms ease',
                      }}
                      title={k}
                    >
                      {r.emoji}
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="Optional — add a note for the engine…"
                value={draft[b.date] || ''}
                onChange={(e) =>
                  setDraft((s) => ({ ...s, [b.date]: e.target.value }))
                }
                style={{ width: '100%', minHeight: 64, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-primary" style={{ flex: 1 }}>
                  <ThumbsUp size={14} />
                  Submit
                </button>
                <button
                  type="button"
                  className="filter-pill"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ThumbsDown size={14} />
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.feedback-stat-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          :global(.feedback-two-pane) {
            grid-template-columns: 1fr !important;
          }
          :global(.feedback-open-grid) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          :global(.feedback-stat-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
