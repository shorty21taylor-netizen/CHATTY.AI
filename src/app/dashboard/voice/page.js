'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mic, Phone, ArrowUpRight, Sparkles } from 'lucide-react';

export default function VoiceAgentsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          className="t-eyebrow"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Mic size={11} style={{ color: 'var(--emerald-bright)' }} />
          Voice agents · ElevenLabs
        </div>
        <h1
          className="t-h1"
          style={{ margin: '8px 0 6px', letterSpacing: '-0.01em' }}
        >
          Voice Agents
        </h1>
        <p
          className="t-body"
          style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}
        >
          Configure and deploy ElevenLabs Conversational AI agents for inbound
          and outbound calls. Clone branded voices, set personality, and route
          calls to the right agent automatically.
        </p>
      </div>

      {/* Empty state card */}
      <div
        className="dark-card"
        style={{
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          background:
            'linear-gradient(180deg, var(--surface-1) 0%, rgba(16,185,129,0.03) 100%)',
          border: '1px dashed var(--border)',
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background:
              'linear-gradient(135deg, var(--emerald-bright), #6366f1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 22px rgba(16,185,129,0.35)',
          }}
        >
          <Phone size={24} style={{ color: '#ffffff' }} fill="#ffffff" />
        </span>
        <div className="t-h2" style={{ margin: 0 }}>
          Voice agent management is coming soon
        </div>
        <p
          className="t-body"
          style={{
            color: 'var(--text-muted)',
            margin: 0,
            maxWidth: 460,
          }}
        >
          In the meantime, head to the <strong>Agents</strong> page to configure
          voices, personalities, and call-handling rules for your existing
          agents.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/dashboard/agents"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'var(--emerald-bright)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            <Sparkles size={13} fill="#ffffff" />
            Manage Agents
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
