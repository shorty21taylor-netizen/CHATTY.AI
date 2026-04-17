'use client';

import { useEffect, useState } from 'react';
import {
  Rocket,
  CreditCard,
  MessageSquare,
  Mic,
  Bot,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

const PLAN_DISPLAY = {
  starter: {
    name: 'Starter',
    price: '$199',
    hint: 'Solo operator',
    features: ['2,000 SMS', '200 voice minutes', '3 AI agents', '1 team seat', 'Daily Brief'],
  },
  pro: {
    name: 'Pro',
    price: '$499',
    hint: 'Growing team',
    features: ['5,000 SMS', '500 voice minutes', 'All 11 AI agents', '5 team seats', 'Telegram EA'],
  },
  scale: {
    name: 'Scale',
    price: '$1,497',
    hint: 'Multi-crew',
    features: [
      '20,000 SMS',
      '2,000 voice minutes',
      'All 11 AI agents',
      'Unlimited team seats',
      'Voice Lab cloning',
      'Priority Decision Engine',
    ],
  },
};

const USAGE_ICONS = {
  sms: MessageSquare,
  voiceMinutes: Mic,
  agents: Bot,
};

const USAGE_LABELS = {
  sms: 'SMS sent',
  voiceMinutes: 'Voice minutes',
  agents: 'Active agents',
};

const USAGE_COLORS = {
  sms: '#3b82f6',
  voiceMinutes: '#8b5cf6',
  agents: '#f59e0b',
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

function UsageCard({ resource, current, limit, color }) {
  const Icon = USAGE_ICONS[resource];
  const label = USAGE_LABELS[resource];
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
  const isHigh = !isUnlimited && pct >= 90;
  const barColor = isHigh ? '#f59e0b' : color;

  return (
    <div
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderColor: isHigh
          ? 'color-mix(in srgb, #f59e0b 40%, var(--border))'
          : 'var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
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
              background: `color-mix(in srgb, ${barColor} 14%, transparent)`,
              color: barColor,
            }}
          >
            <Icon size={13} />
          </span>
          {label}
        </div>
        {isHigh && <Pill color="#f59e0b">LIMIT</Pill>}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-bright)',
            letterSpacing: '-0.02em',
          }}
        >
          {current.toLocaleString('en-US')}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          / {isUnlimited ? '\u221E' : limit.toLocaleString('en-US')}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'color-mix(in srgb, var(--text-muted) 14%, transparent)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            transition: 'width 400ms ease',
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {isUnlimited ? 'Unlimited' : `${pct}% used`}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/stripe/status')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError('Failed to load billing data'))
      .finally(() => setLoading(false));
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || 'Could not open billing portal');
      }
    } catch {
      setError('Network error');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: 12, fontSize: 13 }}>Loading billing&hellip;</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>
        <AlertTriangle size={24} />
        <div style={{ marginTop: 12, fontSize: 13 }}>{error}</div>
      </div>
    );
  }

  const plan = data?.plan || 'starter';
  const planInfo = PLAN_DISPLAY[plan] || PLAN_DISPLAY.starter;
  const status = data?.status || 'none';
  const isActive = data?.isActive ?? false;
  const cancelAtPeriodEnd = data?.cancelAtPeriodEnd ?? false;
  const periodEnd = data?.currentPeriodEnd
    ? new Date(data.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const usage = data?.usage || {};
  const usageEntries = ['sms', 'voiceMinutes', 'agents'].map((key) => ({
    resource: key,
    current: usage[key]?.current ?? 0,
    limit: usage[key]?.limit ?? 0,
    color: USAGE_COLORS[key],
  }));

  const statusColor = isActive
    ? 'var(--primary)'
    : status === 'past_due'
      ? '#f59e0b'
      : '#ef4444';
  const statusLabel = isActive
    ? cancelAtPeriodEnd
      ? 'CANCELING'
      : 'ACTIVE'
    : status === 'past_due'
      ? 'PAST DUE'
      : status === 'none'
        ? 'NO PLAN'
        : status.toUpperCase();

  return (
    <div>
      <div>
        <div className="t-eyebrow">Billing</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Plan &amp; billing
        </h1>
        <p className="t-body-sm" style={{ margin: 0 }}>
          Your current plan, usage, and billing management.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in srgb, #ef4444 12%, transparent)',
            border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)',
            color: '#ef4444',
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Plan hero */}
      <div
        className="dark-card"
        style={{
          padding: 24,
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          borderColor: `color-mix(in srgb, ${statusColor} 40%, var(--border))`,
          boxShadow: isActive ? '0 0 24px rgba(16,185,129,0.12)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: `color-mix(in srgb, ${statusColor} 18%, transparent)`,
              color: statusColor,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Rocket size={22} />
          </div>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: statusColor,
                fontWeight: 600,
              }}
            >
              Current plan
              <Pill color={statusColor}>{statusLabel}</Pill>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-bright)',
                marginTop: 4,
                letterSpacing: '-0.02em',
              }}
            >
              {planInfo.name} &middot; {planInfo.price} / month
            </div>
            {periodEnd && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {cancelAtPeriodEnd
                  ? `Cancels on ${periodEnd}`
                  : `Next invoice: ${periodEnd}`}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {data?.hasSubscription && (
            <button
              type="button"
              className="filter-pill"
              onClick={openPortal}
              disabled={portalLoading}
              style={{ cursor: portalLoading ? 'wait' : 'pointer' }}
            >
              {portalLoading ? 'Opening...' : 'Manage billing'}
            </button>
          )}
          {plan !== 'scale' && (
            <a
              href={`/checkout?plan=${plan === 'starter' ? 'pro' : 'scale'}`}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              <ArrowUpRight size={14} />
              Upgrade to {plan === 'starter' ? 'Pro' : 'Scale'}
            </a>
          )}
        </div>
      </div>

      {/* Usage */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 12,
          }}
        >
          Usage this cycle
        </div>
        <div
          className="billing-usage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {usageEntries.map((u) => (
            <UsageCard key={u.resource} {...u} />
          ))}
        </div>
      </div>

      {/* Payment method — opens Stripe portal */}
      {data?.hasSubscription && (
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 12,
            }}
          >
            Payment method
          </div>
          <div
            className="dark-card"
            style={{
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'color-mix(in srgb, #635bff 18%, transparent)',
                  color: '#635bff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                  }}
                >
                  Managed by Stripe
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  Update your payment method via the billing portal
                </div>
              </div>
            </div>
            <button
              type="button"
              className="filter-pill"
              onClick={openPortal}
              disabled={portalLoading}
              style={{ cursor: portalLoading ? 'wait' : 'pointer' }}
            >
              {portalLoading ? 'Opening...' : 'Update card'}
            </button>
          </div>
        </div>
      )}

      {/* Plan comparison */}
      <div style={{ marginTop: 28 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Compare plans
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          Upgrade anytime &mdash; usage carries over within the cycle.
        </div>
        <div
          className="billing-plan-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {Object.entries(PLAN_DISPLAY).map(([key, p]) => {
            const isCurrent = key === plan;
            return (
              <div
                key={key}
                className="dark-card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderColor: isCurrent
                    ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
                    : 'var(--border)',
                  boxShadow: isCurrent ? '0 0 24px rgba(16,185,129,0.10)' : 'none',
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
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                    }}
                  >
                    {p.name}
                  </div>
                  {isCurrent && <Pill color="var(--primary)">CURRENT</Pill>}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'var(--text-bright)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {p.price}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    / month
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {p.hint}
                </div>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'var(--text-body)',
                      }}
                    >
                      <CheckCircle2
                        size={13}
                        style={{ color: 'var(--primary)', flexShrink: 0 }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button
                    type="button"
                    className="filter-pill"
                    disabled
                    style={{
                      marginTop: 'auto',
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                  >
                    Current plan
                  </button>
                ) : (
                  <a
                    href={`/checkout?plan=${key}`}
                    className="btn-primary"
                    style={{
                      marginTop: 'auto',
                      textDecoration: 'none',
                      textAlign: 'center',
                    }}
                  >
                    Switch to {p.name}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* No subscription CTA */}
      {!data?.hasSubscription && (
        <div
          className="dark-card"
          style={{
            padding: 24,
            marginTop: 28,
            textAlign: 'center',
            borderColor: 'color-mix(in srgb, var(--primary) 30%, var(--border))',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 8 }}>
            No active subscription
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Choose a plan to unlock all Chatty.AI features.
          </div>
          <a
            href="/checkout?plan=starter"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Get started
          </a>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.billing-usage-grid),
          :global(.billing-plan-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
