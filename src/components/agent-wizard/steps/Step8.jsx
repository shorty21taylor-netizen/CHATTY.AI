'use client';

import {
  Field,
  NumberInput,
  RadioGroup,
  TimeInput,
  TagInput,
  Checkbox,
  Textarea,
} from '@/components/agent/FormPrimitives';

export default function Step8Guardrails({ config, updateConfig }) {
  const g = config.guardrails;

  function setG(key, value) {
    updateConfig((c) => ({
      ...c,
      guardrails: { ...c.guardrails, [key]: value },
    }));
  }
  function setRL(key, value) {
    updateConfig((c) => ({
      ...c,
      guardrails: {
        ...c.guardrails,
        rate_limits: { ...c.guardrails.rate_limits, [key]: value },
      },
    }));
  }
  function setQH(key, value) {
    updateConfig((c) => ({
      ...c,
      guardrails: {
        ...c.guardrails,
        quiet_hours: { ...c.guardrails.quiet_hours, [key]: value },
      },
    }));
  }
  function setPP(key, value) {
    updateConfig((c) => ({
      ...c,
      guardrails: {
        ...c.guardrails,
        prohibited_promises: { ...c.guardrails.prohibited_promises, [key]: value },
      },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Safety rails so the agent never does anything you'd regret.
      </p>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 10,
          }}
        >
          Rate limits per contact
        </div>
        <div
          className="cw-grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
        >
          <Field label="Max per hour">
            <NumberInput
              value={g.rate_limits.per_hour}
              onChange={(v) => setRL('per_hour', v)}
              min={0}
            />
          </Field>
          <Field label="Max per day">
            <NumberInput
              value={g.rate_limits.per_day}
              onChange={(v) => setRL('per_day', v)}
              min={0}
            />
          </Field>
          <Field label="Max per week">
            <NumberInput
              value={g.rate_limits.per_week}
              onChange={(v) => setRL('per_week', v)}
              min={0}
            />
          </Field>
        </div>
      </div>

      <Field label="Quiet hours">
        <RadioGroup
          value={g.quiet_hours_mode}
          onChange={(v) => setG('quiet_hours_mode', v)}
          options={[
            { value: 'inherit', label: 'Inherit from Business Profile' },
            { value: 'custom', label: 'Override' },
          ]}
        />
        {g.quiet_hours_mode === 'custom' ? (
          <div
            style={{
              marginTop: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TimeInput
              value={g.quiet_hours.start}
              onChange={(v) => setQH('start', v)}
            />
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <TimeInput
              value={g.quiet_hours.end}
              onChange={(v) => setQH('end', v)}
            />
          </div>
        ) : null}
      </Field>

      <Field label="Do-not-contact list" hint="Paste phone numbers or emails">
        <Textarea
          value={(g.do_not_contact || []).join('\n')}
          onChange={(v) =>
            setG(
              'do_not_contact',
              v
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean)
            )
          }
          rows={4}
          placeholder={'(555) 111-2222\n(555) 333-4444\nspammer@example.com'}
        />
      </Field>

      <Field label="Banned topics">
        <TagInput
          value={g.banned_topics}
          onChange={(v) => setG('banned_topics', v)}
          placeholder="Add a topic and press Enter"
        />
      </Field>

      <Field label="Max touches before auto-archive">
        <NumberInput
          value={g.max_touches_before_archive}
          onChange={(v) => setG('max_touches_before_archive', v)}
          min={1}
          max={20}
        />
      </Field>

      <div
        style={{
          padding: 14,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Checkbox
          value={g.required_sms_disclosure}
          onChange={(v) => setG('required_sms_disclosure', v)}
          label="Include 'Reply STOP to opt out' on first SMS"
          hint="Required by carrier guidelines in the US"
        />

        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          Prohibited promises
        </div>
        <Checkbox
          value={g.prohibited_promises.no_pricing}
          onChange={(v) => setPP('no_pricing', v)}
          label="No pricing commitments"
        />
        <Checkbox
          value={g.prohibited_promises.no_timeline}
          onChange={(v) => setPP('no_timeline', v)}
          label="No timeline commitments"
        />
        <Checkbox
          value={g.prohibited_promises.no_warranty_extension}
          onChange={(v) => setPP('no_warranty_extension', v)}
          label="No warranty extensions"
        />
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.cw-grid-3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
