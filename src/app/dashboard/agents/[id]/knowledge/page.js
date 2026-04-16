'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAgentById } from '@/lib/agents/registry';
import {
  loadAgentConfig,
  saveAgentConfig,
  agentConfigStatus,
} from '@/lib/agents/storage';
import { StatusBadge, ProgressRing } from '@/components/agent/FormPrimitives';
import { AgentTabs } from '@/components/agent/AgentTabs';
import Step6Knowledge from '@/components/agent-wizard/steps/Step6';

export default function KnowledgeAgentPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);
  if (!agent) return notFound();

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    setConfig(loadAgentConfig(id));
    setHydrated(true);
  }, [id]);

  const status = useMemo(() => agentConfigStatus(config), [config]);
  const Icon = agent.icon;

  function updateConfig(updater) {
    setConfig((c) => {
      const next = typeof updater === 'function' ? updater(c) : updater;
      saveAgentConfig(id, next);
      return next;
    });
  }

  return (
    <div>
      <Link
        href={`/dashboard/agents/${id}`}
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
        <ArrowLeft size={14} /> Back to {agent.name}
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: `color-mix(in srgb, ${agent.color} 18%, transparent)`,
              color: agent.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--text-muted)' }}>
              Knowledge base
            </div>
            <h1
              className="t-h1"
              style={{
                margin: '4px 0 6px',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '-0.01em',
              }}
            >
              {agent.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Documents, quick facts, and competitor notes this agent can reference.
            </p>
          </div>
        </div>
        {hydrated ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <StatusBadge status={status.status} />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              <ProgressRing
                value={status.completeness}
                size={30}
                stroke={3}
                label={`${status.completeness}%`}
              />
              <span>
                {status.steps} of {status.total} steps
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <AgentTabs agentId={id} active="knowledge" />

      <div className="dark-card" style={{ padding: 24 }}>
        {hydrated && config ? (
          <Step6Knowledge
            agent={agent}
            config={config}
            updateConfig={updateConfig}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
