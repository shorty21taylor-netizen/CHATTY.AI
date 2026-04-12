'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Zap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Repeat,
  RotateCw,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { getAgentById, STATUS_META } from '@/lib/agents';
import { VOICE_NOTE_TEMPLATES } from '@/lib/voiceNotes';
import { VoiceNoteCard } from '@/components/VoiceNoteCard';
import { SequenceBuilder } from '@/components/SequenceBuilder';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const ICONS = {
  Phone,
  Zap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Repeat,
  RotateCw,
  Users,
};

// Map agent id → default voice-note template key.
const TEMPLATE_FOR = {
  'dead-lead-reactivation': 'dead_lead_60day',
  'ghosted-bid-reopener': 'ghosted_bid',
  'old-customer-reengagement': 'old_customer',
};

export default function AgentConfigPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);

  if (!agent) return notFound();

  const Icon = ICONS[agent.icon] || Phone;
  const meta = STATUS_META[agent.status];
  const templateKey = TEMPLATE_FOR[agent.id];
  const defaultScript = templateKey ? VOICE_NOTE_TEMPLATES[templateKey] : '';

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/agents"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={14} /> All agents
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--emerald-tint)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} style={{ color: 'var(--emerald-bright)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-eyebrow">{agent.pillar} agent</div>
          <h1 className="t-h1" style={{ margin: '6px 0 6px' }}>
            {agent.name}
          </h1>
          <p className="t-body" style={{ color: 'var(--text-muted)', margin: 0 }}>
            {agent.description}
          </p>
        </div>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: meta.bg,
            color: meta.color,
            border: '1px solid ' + meta.border,
            flexShrink: 0,
          }}
        >
          {meta.label}
        </span>
      </div>

      <AnimatedGroup preset="blur-slide">
        {agent.voiceNotes ? (
          <>
            <VoiceNoteCard defaultScript={defaultScript} />
            <SequenceBuilder />
          </>
        ) : (
          <StandardConfig agent={agent} />
        )}
      </AnimatedGroup>
    </div>
  );
}

function StandardConfig({ agent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <div className="dark-card" style={{ padding: 24 }}>
        <div className="t-h2" style={{ marginBottom: 4 }}>
          Trigger rules
        </div>
        <p className="t-body-sm" style={{ marginBottom: 16 }}>
          When {agent.name.toLowerCase()} should fire.
        </p>
        <div style={{ marginBottom: 14 }}>
          <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
            Trigger event
          </label>
          <select style={{ width: '100%' }} defaultValue="lead-created">
            <option value="lead-created">New lead created</option>
            <option value="missed-call">Missed inbound call</option>
            <option value="no-show">Appointment no-show</option>
            <option value="estimate-sent">Estimate sent</option>
          </select>
        </div>
        <div>
          <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
            Delay
          </label>
          <input type="text" defaultValue="60 seconds" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="dark-card" style={{ padding: 24 }}>
        <div className="t-h2" style={{ marginBottom: 4 }}>
          SMS templates
        </div>
        <p className="t-body-sm" style={{ marginBottom: 16 }}>
          First-touch message for every new lead.
        </p>
        <div>
          <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
            Template
          </label>
          <textarea
            rows={5}
            defaultValue={"Hey {firstName}, thanks for reaching out to {companyName} about your {jobType}. When's a good time to talk?"}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div className="dark-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
        <div className="t-h2" style={{ marginBottom: 4 }}>
          Cadence
        </div>
        <p className="t-body-sm" style={{ marginBottom: 16 }}>
          How often this agent follows up.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
              Max attempts
            </label>
            <input type="number" defaultValue={3} style={{ width: '100%' }} />
          </div>
          <div>
            <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
              Between attempts
            </label>
            <input type="text" defaultValue="2 hours" style={{ width: '100%' }} />
          </div>
          <div>
            <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
              Quiet hours
            </label>
            <input type="text" defaultValue="9pm – 8am local" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
