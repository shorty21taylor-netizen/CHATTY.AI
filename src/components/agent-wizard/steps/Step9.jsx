'use client';

import {
  Field,
  Checkbox,
  RadioGroup,
  Select,
  NumberInput,
  Textarea,
} from '@/components/agent/FormPrimitives';

const ESC_TRIGGERS = [
  { id: 'legal_threats', label: 'Legal threats', hint: 'Lawsuits, attorney mentions' },
  { id: 'anger_or_complaint', label: 'Anger / complaint', hint: 'Profanity, hostile tone' },
  { id: 'out_of_range_pricing', label: 'Out-of-range pricing question' },
  { id: 'wrong_service_area', label: 'Wrong service area' },
  { id: 'requests_human', label: 'Lead explicitly asks for a human' },
  { id: 'refund_request', label: 'Refund or cancellation request' },
];

const CHANNEL_OPTIONS = [
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
  { value: 'telegram_ea', label: 'Telegram EA' },
  { value: 'all', label: 'All channels' },
];

const TEAM = [
  { value: 'marcus-johnson', label: 'Marcus Johnson (Owner)' },
  { value: 'sarah-ops', label: 'Sarah — Ops' },
  { value: 'kevin-sales', label: 'Kevin — Sales Lead' },
];

export default function Step9Escalation({ config, updateConfig }) {
  const e = config.escalation;

  function setE(key, value) {
    updateConfig((c) => ({
      ...c,
      escalation: { ...c.escalation, [key]: value },
    }));
  }
  function setTrig(key, value) {
    updateConfig((c) => ({
      ...c,
      escalation: {
        ...c.escalation,
        triggers: { ...c.escalation.triggers, [key]: value },
      },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        When something goes off-script, who gets notified and what does the
        agent do while it waits?
      </p>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 8,
          }}
        >
          Escalate immediately on
        </div>
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
          {ESC_TRIGGERS.map((t) => (
            <Checkbox
              key={t.id}
              value={!!e.triggers[t.id]}
              onChange={(v) => setTrig(t.id, v)}
              label={t.label}
              hint={t.hint}
            />
          ))}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingTop: 8,
              borderTop: '1px solid var(--border)',
            }}
          >
            <Checkbox
              value={Number(e.triggers.lead_value_above) > 0}
              onChange={(v) =>
                setTrig('lead_value_above', v ? 25000 : 0)
              }
              label="Lead value over"
            />
            <div style={{ width: 140 }}>
              <NumberInput
                value={e.triggers.lead_value_above || 0}
                onChange={(v) => setTrig('lead_value_above', v)}
                min={0}
                step={1000}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="cw-grid-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}
      >
        <Field label="Notification channel">
          <RadioGroup
            value={e.channel}
            onChange={(v) => setE('channel', v)}
            options={CHANNEL_OPTIONS}
          />
        </Field>
        <Field label="Team member to notify">
          <Select
            value={e.notify_user_id}
            onChange={(v) => setE('notify_user_id', v)}
            options={TEAM}
          />
        </Field>
      </div>

      <Field label="Agent behavior while waiting for human">
        <RadioGroup
          value={e.while_waiting}
          onChange={(v) => setE('while_waiting', v)}
          options={[
            { value: 'silent', label: 'Stay silent' },
            { value: 'holding_message', label: 'Send a holding message' },
          ]}
        />
      </Field>

      {e.while_waiting === 'holding_message' ? (
        <Field label="Holding message">
          <Textarea
            value={e.holding_message}
            onChange={(v) => setE('holding_message', v)}
            rows={3}
          />
        </Field>
      ) : null}

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.cw-grid-2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
