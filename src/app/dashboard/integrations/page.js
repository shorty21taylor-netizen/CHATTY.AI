'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Mic,
  Mail,
  Calendar,
  CreditCard,
  Cloud,
  Webhook,
  Building2,
  Target,
  Share2,
  Copy,
  CheckCircle2,
} from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'connected', label: 'Connected' },
  { key: 'available', label: 'Available' },
];

const INTEGRATIONS = [
  {
    key: 'twilio',
    name: 'Twilio',
    category: 'SMS',
    icon: MessageSquare,
    color: '#ef4444',
    status: 'connected',
    desc: 'SMS delivery and voice PSTN for every outbound message.',
    meta: 'Sub-account active · +1 (555) 123-4500',
  },
  {
    key: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'Voice',
    icon: Mic,
    color: 'var(--primary)',
    status: 'connected',
    desc: 'Conversational AI voice agents, TTS, and Voice Lab cloning.',
    meta: '3 agents running · 6 voices',
  },
  {
    key: 'gmail',
    name: 'Gmail',
    category: 'Email',
    icon: Mail,
    color: '#3b82f6',
    status: 'connected',
    desc: 'Sync inbound sales emails as interactions.',
    meta: 'anthony@taylorroofing.com',
  },
  {
    key: 'gcal',
    name: 'Google Calendar',
    category: 'Calendar',
    icon: Calendar,
    color: '#8b5cf6',
    status: 'connected',
    desc: 'Book appointments directly onto your calendar.',
    meta: '2 calendars linked',
  },
  {
    key: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    icon: CreditCard,
    color: '#635bff',
    status: 'connected',
    desc: 'Deposit capture and subscription billing.',
    meta: 'Live mode · Growth plan',
  },
  {
    key: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    icon: Building2,
    color: '#00a1e0',
    status: 'unavailable',
    desc: "Chatty is the CRM. We don't integrate with Salesforce by design.",
    meta: 'Not on the roadmap',
  },
  {
    key: 'hubspot',
    name: 'HubSpot',
    category: 'CRM',
    icon: Building2,
    color: '#ff7a59',
    status: 'unavailable',
    desc: "Chatty is the CRM. We don't integrate with HubSpot by design.",
    meta: 'Not on the roadmap',
  },
  {
    key: 'gads',
    name: 'Google Ads',
    category: 'Ads',
    icon: Target,
    color: '#f59e0b',
    status: 'available',
    desc: 'Pull ad-click signals to score lead intent on arrival.',
    meta: 'OAuth required',
  },
  {
    key: 'fbads',
    name: 'Facebook Ads',
    category: 'Ads',
    icon: Share2,
    color: '#1877f2',
    status: 'available',
    desc: 'Track Meta ad-click and lead form signals.',
    meta: 'Meta Business Manager',
  },
  {
    key: 'outlook',
    name: 'Outlook',
    category: 'Email',
    icon: Mail,
    color: '#0078d4',
    status: 'available',
    desc: 'Microsoft 365 inbox sync for sales email signals.',
    meta: 'Microsoft Graph',
  },
  {
    key: 'weather',
    name: 'Weather API',
    category: 'External signals',
    icon: Cloud,
    color: '#38bdf8',
    status: 'available',
    desc: 'Route storm-driven opportunities into priority briefs.',
    meta: 'No auth — key issued by Chatty',
  },
  {
    key: 'webhook',
    name: 'Custom Webhook',
    category: 'External signals',
    icon: Webhook,
    color: '#a855f7',
    status: 'available',
    desc: 'Pipe any event into Chatty with HMAC-signed POST requests.',
    meta: 'Configure below',
  },
];

const STATUS_CONFIG = {
  connected: { label: 'CONNECTED', color: 'var(--primary)' },
  available: { label: 'AVAILABLE', color: '#3b82f6' },
  unavailable: { label: 'BY DESIGN', color: 'var(--text-muted)' },
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

const WEBHOOK_SNIPPET = `curl -X POST https://chattyai.app/api/signal/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Chatty-Signature: <hmac-sha256>" \\
  -d '{
    "source_key": "acme_storm_routing",
    "event_type": "lead_received",
    "entity_type": "lead",
    "data": {
      "name": "Patricia Williams",
      "phone": "+15551234567",
      "service": "roofing",
      "intent_score": 0.87
    }
  }'`;

export default function IntegrationsPage() {
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const visible = INTEGRATIONS.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'connected') return i.status === 'connected';
    if (filter === 'available')
      return i.status === 'available' || i.status === 'unavailable';
    return true;
  });

  const connectedCount = INTEGRATIONS.filter((i) => i.status === 'connected').length;
  const totalCount = INTEGRATIONS.length;

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      setCopied(false);
    }
  }

  return (
    <div>
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
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <CheckCircle2 size={12} />
            {connectedCount} of {totalCount} connected
          </div>
          <h1 className="t-h1" style={{ margin: '4px 0 6px' }}>
            Integrations
          </h1>
          <p className="t-body-sm" style={{ margin: 0 }}>
            Signal sources feeding the Decision Engine.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={active ? 'filter-pill-active' : 'filter-pill'}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Integration grid */}
      <div
        className="integrations-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 20,
        }}
      >
        {visible.map((i) => {
          const Icon = i.icon;
          const status = STATUS_CONFIG[i.status];
          const isConnected = i.status === 'connected';
          const isUnavailable = i.status === 'unavailable';
          return (
            <div
              key={i.key}
              className="dark-card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                opacity: isUnavailable ? 0.7 : 1,
                borderColor: isConnected
                  ? 'color-mix(in srgb, var(--primary) 30%, var(--border))'
                  : 'var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${i.color} 18%, transparent)`,
                      color: i.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-bright)',
                      }}
                    >
                      {i.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 2,
                      }}
                    >
                      {i.category}
                    </div>
                  </div>
                </div>
                <Pill color={status.color}>{status.label}</Pill>
              </div>

              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                  minHeight: 54,
                }}
              >
                {i.desc}
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-body)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
                  border: '1px solid var(--border)',
                }}
              >
                {i.meta}
              </div>

              <button
                type="button"
                className={isConnected ? 'filter-pill' : 'btn-primary'}
                disabled={isUnavailable}
                style={{
                  opacity: isUnavailable ? 0.6 : 1,
                  cursor: isUnavailable ? 'not-allowed' : 'pointer',
                }}
              >
                {isConnected
                  ? 'Manage'
                  : isUnavailable
                  ? 'Not available'
                  : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom webhook panel */}
      <div
        className="dark-card"
        style={{ padding: 24, marginTop: 28 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#a855f7',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              <Webhook size={13} />
              Custom webhook
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
                marginTop: 8,
              }}
            >
              Pipe any event into the Signal Network
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 4,
                maxWidth: 560,
              }}
            >
              POST JSON events with an HMAC-SHA256 signature. Chatty embeds them,
              stores them in <code>signal_events</code>, and the Decision Engine
              reasons over them inside your next daily brief.
            </div>
          </div>
          <button
            type="button"
            onClick={copySnippet}
            className="filter-pill"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <pre
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 10,
            background: 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
            border: '1px solid var(--border)',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.55,
            color: 'var(--text-bright)',
            overflow: 'auto',
            whiteSpace: 'pre',
          }}
        >
          {WEBHOOK_SNIPPET}
        </pre>
      </div>

      <style jsx>{`
        @media (max-width: 1100px) {
          :global(.integrations-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          :global(.integrations-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
