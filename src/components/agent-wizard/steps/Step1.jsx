'use client';

import {
  Field,
  Textarea,
  Select,
} from '@/components/agent/FormPrimitives';

export default function Step1Mission({ agent, config, updateConfig }) {
  function setMission(key, value) {
    updateConfig((c) => ({
      ...c,
      mission: { ...c.mission, [key]: value },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Define what success looks like for this agent. Keep the mission sharp —
        it becomes part of every prompt.
      </p>

      <Field
        label="Mission statement"
        hint="Pre-filled from the agent type — edit to match your business"
      >
        <Textarea
          value={config.mission.statement}
          onChange={(v) => setMission('statement', v)}
          rows={4}
          placeholder={agent.missionDefault}
        />
      </Field>

      <Field
        label="Primary success metric"
        hint="The single number you'll judge this agent by"
      >
        <Select
          value={config.mission.success_metric || ''}
          onChange={(v) => setMission('success_metric', v)}
          options={agent.successMetrics.map((m) => ({
            value: m.id,
            label: m.label,
          }))}
        />
      </Field>

      <Field
        label="Single non-negotiable guardrail"
        hint="What this agent must NEVER do, under any circumstance"
      >
        <Textarea
          value={config.mission.non_negotiable}
          onChange={(v) => setMission('non_negotiable', v)}
          rows={3}
          placeholder="Never promise a price without owner approval."
        />
      </Field>
    </div>
  );
}
