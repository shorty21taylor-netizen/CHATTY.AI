'use client';

import Link from 'next/link';
import {
  Check,
  AlertTriangle,
  Rocket,
} from 'lucide-react';
import {
  Field,
  RadioGroup,
  Checkbox,
} from '@/components/agent/FormPrimitives';
import { businessProfileStatus } from '@/lib/agents/storage';
import { AGENT_TOOLS } from '@/lib/agents/registry';

const MODE_OPTIONS = [
  {
    value: 'shadow',
    label: 'Shadow Mode',
    hint: 'Agent runs, messages queued for 24h review',
  },
  {
    value: 'draft',
    label: 'Draft Mode',
    hint: 'AI drafts, you one-click send',
  },
  {
    value: 'full_auto',
    label: 'Full Auto',
    hint: 'AI sends within guardrails',
  },
];

const SCHEDULE_OPTIONS = [
  { value: 'now', label: 'Activate now' },
  { value: 'tomorrow_6am', label: 'Tomorrow at 6am' },
  { value: 'manual', label: 'On manual toggle' },
];

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: 'var(--text-bright)',
          textAlign: 'right',
          maxWidth: '70%',
        }}
      >
        {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
      </span>
    </div>
  );
}

export default function Step11Activation({
  agent,
  config,
  businessProfile,
  updateConfig,
}) {
  const a = config.activation;

  function setA(key, value) {
    updateConfig((c) => ({
      ...c,
      activation: { ...c.activation, [key]: value },
    }));
  }
  function setNotify(key, value) {
    updateConfig((c) => ({
      ...c,
      activation: {
        ...c.activation,
        notify: { ...c.activation.notify, [key]: value },
      },
    }));
  }

  const bpStatus = businessProfile ? businessProfileStatus(businessProfile) : null;
  const simulationPassed =
    Object.values(config.simulation?.passed || {}).filter(Boolean).length;
  const simulationReady = simulationPassed >= 4;
  const profileReady = bpStatus?.complete !== false;
  const canActivate = simulationReady && profileReady;

  function activate() {
    const next = {
      ...config,
      status: a.mode === 'shadow' ? 'shadow' : a.mode === 'draft' ? 'draft' : 'active',
      completeness: {
        ...(config.completeness || {}),
        activation: true,
      },
      activated_at: new Date().toISOString(),
    };
    updateConfig(() => next);
    // Persist via storage util — parent also saves on next-step; this is
    // the explicit activation click.
    import('@/lib/agents/storage').then(({ saveAgentConfig }) => {
      saveAgentConfig(agent.id, next);
    });
  }

  // Summary builders
  const triggerSummary = config.triggers.event_type;
  const contextCount = Object.values(config.context || {}).filter(Boolean).length;
  const toolsOn = AGENT_TOOLS.filter(
    (t) => (config.tools?.[t.id] || 'off') !== 'off'
  ).length;
  const rateLimitSummary = `${config.guardrails.rate_limits.per_day}/day · ${config.guardrails.rate_limits.per_week}/week`;
  const escalationChannels = config.escalation.channel;
  const voiceSummary =
    config.voice.mode === 'inherit'
      ? 'Inherits business profile'
      : `Custom (F${config.voice.formality} · V${config.voice.verbosity} · W${config.voice.warmth})`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Review the full config, pick an operating mode, and ship it.
      </p>

      {/* Readiness callouts */}
      {!profileReady ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border))',
            background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
            color: '#f59e0b',
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={14} />
          Business Profile incomplete.{' '}
          <Link
            href="/dashboard/business-profile"
            style={{ color: '#f59e0b', fontWeight: 700, textDecoration: 'underline' }}
          >
            Complete it →
          </Link>
        </div>
      ) : null}
      {!simulationReady ? (
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border))',
            background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
            color: '#f59e0b',
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={14} />
          Only {simulationPassed} of {agent.simulationScenarios?.length || 5}{' '}
          simulations passed. Need at least 4.
        </div>
      ) : null}

      {/* Summary card */}
      <div
        className="dark-card"
        style={{ padding: 18, display: 'flex', flexDirection: 'column' }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-bright)',
            marginBottom: 8,
          }}
        >
          Full configuration
        </div>
        <SummaryRow label="Mission" value={config.mission.statement} />
        <SummaryRow
          label="Success metric"
          value={
            agent.successMetrics.find((m) => m.id === config.mission.success_metric)
              ?.label
          }
        />
        <SummaryRow label="Non-negotiable" value={config.mission.non_negotiable} />
        <SummaryRow label="Trigger" value={triggerSummary} />
        <SummaryRow label="Context fields" value={`${contextCount} of 8 enabled`} />
        <SummaryRow label="Voice" value={voiceSummary} />
        <SummaryRow label="Tools on" value={`${toolsOn} of ${AGENT_TOOLS.length}`} />
        <SummaryRow label="Rate limits" value={rateLimitSummary} />
        <SummaryRow
          label="Escalation channel"
          value={escalationChannels}
        />
        <SummaryRow
          label="Simulation"
          value={`${simulationPassed}/${agent.simulationScenarios?.length || 5} passed`}
        />
      </div>

      <Field label="Operating mode">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODE_OPTIONS.map((m) => {
            const selected = a.mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setA('mode', m.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${
                    selected
                      ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
                      : 'var(--border)'
                  }`,
                  background: selected
                    ? 'color-mix(in srgb, var(--primary) 6%, transparent)'
                    : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: selected ? 'var(--primary)' : 'var(--text-bright)',
                  }}
                >
                  {m.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {m.hint}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Schedule">
        <RadioGroup
          value={a.schedule}
          onChange={(v) => setA('schedule', v)}
          options={SCHEDULE_OPTIONS}
        />
      </Field>

      <Field label="Notification preferences">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 14,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <Checkbox
            value={a.notify.text_each_action}
            onChange={(v) => setNotify('text_each_action', v)}
            label="Text me each action"
          />
          <Checkbox
            value={a.notify.daily_summary}
            onChange={(v) => setNotify('daily_summary', v)}
            label="Daily summary"
          />
          <Checkbox
            value={a.notify.only_escalations}
            onChange={(v) => setNotify('only_escalations', v)}
            label="Only escalations"
          />
        </div>
      </Field>

      <button
        type="button"
        disabled={!canActivate}
        onClick={activate}
        className="btn-primary"
        style={{
          justifyContent: 'center',
          padding: '14px 20px',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.02em',
          opacity: canActivate ? 1 : 0.5,
          cursor: canActivate ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Rocket size={16} />
        {config.status === 'shadow' ||
        config.status === 'draft' ||
        config.status === 'active'
          ? `Update ${agent.name}`
          : `Activate ${agent.name}`}
      </button>
      {config.activated_at ? (
        <div
          style={{
            fontSize: 12,
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
          }}
        >
          <Check size={12} /> Activated at{' '}
          {new Date(config.activated_at).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
}
