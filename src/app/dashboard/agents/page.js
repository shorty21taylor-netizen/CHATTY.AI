'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Circle,
  Clock,
  Gauge,
  Smile,
} from 'lucide-react';
import { VOICE_AGENTS, VOICE_AGENT_STATUS } from '@/lib/voiceAgents';
import { VoiceConfigPanel } from '@/components/agent/VoiceConfigPanel';

const TYPE_ICON = {
  voice: Phone,
  sms: MessageSquare,
  email: Mail,
};

export default function AgentsPage() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Voice Agents</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Your AI phone team
        </h1>
        <p
          className="t-body"
          style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 640 }}
        >
          Configure the voice, personality, and call-handling behavior for every
          agent. ElevenLabs powers all live voice.
        </p>
      </div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
          marginBottom: 24,
        }}
      >
        {VOICE_AGENTS.map((agent) => {
          const expanded = expandedId === agent.id;
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              expanded={expanded}
              onToggle={() =>
                setExpandedId((id) => (id === agent.id ? null : agent.id))
              }
            />
          );
        })}
      </motion.div>

      {/* Inline expanded config panel — full-width under the grid */}
      <AnimatePresence initial={false}>
        {expandedId ? (
          <motion.div
            key={expandedId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ marginBottom: 28 }}
          >
            <VoiceConfigPanel
              defaultOpen
              agentName={
                VOICE_AGENTS.find((a) => a.id === expandedId)?.name ||
                'Voice Agent'
              }
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ agent, expanded, onToggle }) {
  const Icon = TYPE_ICON[agent.type] || Phone;
  const status = VOICE_AGENT_STATUS[agent.status] || VOICE_AGENT_STATUS.draft;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      className="dark-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        borderColor: expanded ? 'var(--emerald-bright)' : undefined,
        boxShadow: expanded ? '0 0 0 1px var(--emerald-glow)' : undefined,
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      {/* Top row: icon + name + status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--emerald-tint)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color: 'var(--emerald-bright)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-h3" style={{ marginBottom: 4 }}>
            {agent.name}
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Description */}
      <p
        className="t-body-sm"
        style={{
          margin: 0,
          marginBottom: 14,
          color: 'var(--text-muted)',
          minHeight: 40,
        }}
      >
        {agent.description}
      </p>

      {/* Last active */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 16,
          fontSize: 11.5,
          color: 'var(--text-subtle)',
        }}
      >
        <Clock size={11} />
        <span>Last active {agent.lastActive}</span>
      </div>

      {/* Quick stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          padding: '12px 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          marginBottom: 14,
        }}
      >
        <Stat
          label="Calls"
          value={agent.stats.callsHandled}
          icon={Phone}
        />
        <Stat
          label="Avg"
          value={agent.stats.avgDuration}
          icon={Gauge}
        />
        <Stat
          label="CSAT"
          value={`${agent.stats.satisfaction}%`}
          icon={Smile}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '9px 12px',
            borderRadius: 10,
            border: expanded
              ? '1px solid var(--emerald-bright)'
              : '1px solid var(--border)',
            background: expanded ? 'var(--emerald-tint)' : 'transparent',
            color: expanded ? 'var(--emerald-bright)' : 'var(--text-bright)',
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          Configure
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <Link
          href={`/dashboard/agents/${agent.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '9px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12.5,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all .15s',
          }}
        >
          Open <ArrowUpRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: status.bg,
        color: status.color,
        border: `1px solid ${status.border}`,
      }}
    >
      {status.dot ? (
        <motion.span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: status.color,
            display: 'inline-block',
          }}
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      ) : (
        <Circle size={6} style={{ color: status.color }} />
      )}
      {status.label}
    </span>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-subtle)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        <Icon size={10} />
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-bright)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
