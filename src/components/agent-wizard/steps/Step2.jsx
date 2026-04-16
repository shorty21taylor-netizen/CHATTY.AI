'use client';

import {
  Field,
  Select,
  ChipMultiSelect,
  RadioGroup,
  NumberInput,
  TimeInput,
} from '@/components/agent/FormPrimitives';

const EVENT_TYPES = [
  { value: 'lead_received', label: 'Lead received' },
  { value: 'form_submitted', label: 'Form submitted' },
  { value: 'social_dm_received', label: 'Social DM received' },
  { value: 'quote_sent', label: 'Quote sent' },
  { value: 'quote_viewed', label: 'Quote viewed' },
  { value: 'quote_no_reply_7d', label: 'Quote no reply (7d)' },
  { value: 'appointment_booked', label: 'Appointment booked' },
  { value: 'no_reply_24h', label: 'No reply (24h)' },
  { value: 'objection_detected', label: 'Objection detected' },
  { value: 'job_completed', label: 'Job completed' },
  { value: 'no_contact_30d', label: 'No contact (30d)' },
  { value: 'past_customer_12mo', label: 'Past customer (12mo)' },
  { value: 'telegram_message', label: 'Telegram message' },
];

const SOURCES = [
  'Google Ads',
  'Facebook',
  'Instagram',
  'Website',
  'Referral',
  'Home Advisor',
  'Angies List',
  'Google LSA',
  'Phone call',
  'Walk-in',
];

const SERVICE_TYPES = [
  'Roofing',
  'HVAC',
  'Solar',
  'Siding',
  'Windows',
  'Gutters',
  'Painting',
  'Remodeling',
];

const UNITS = [
  { value: 'minutes', label: 'minutes' },
  { value: 'hours', label: 'hours' },
  { value: 'days', label: 'days' },
];

export default function Step2Triggers({ config, updateConfig }) {
  const t = config.triggers;
  function set(key, value) {
    updateConfig((c) => ({
      ...c,
      triggers: { ...c.triggers, [key]: value },
    }));
  }
  function setCooldown(key, value) {
    updateConfig((c) => ({
      ...c,
      triggers: {
        ...c.triggers,
        cooldown: { ...c.triggers.cooldown, [key]: value },
      },
    }));
  }
  function setCustomWindow(key, value) {
    updateConfig((c) => ({
      ...c,
      triggers: {
        ...c.triggers,
        custom_window: { ...c.triggers.custom_window, [key]: value },
      },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        When should this agent fire, and who should it ignore?
      </p>

      <Field label="Event that fires this agent">
        <Select
          value={t.event_type}
          onChange={(v) => set('event_type', v)}
          options={EVENT_TYPES}
        />
      </Field>

      <Field label="Source filter" hint="Empty = all sources">
        <ChipMultiSelect
          value={t.source_filters}
          onChange={(v) => set('source_filters', v)}
          options={SOURCES}
        />
      </Field>

      <Field label="Service type filter" hint="Empty = all services">
        <ChipMultiSelect
          value={t.service_type_filter}
          onChange={(v) => set('service_type_filter', v)}
          options={SERVICE_TYPES}
        />
      </Field>

      <Field label="Time window">
        <RadioGroup
          value={t.time_window}
          onChange={(v) => set('time_window', v)}
          options={[
            { value: 'business_hours', label: 'Business hours only' },
            { value: 'anytime', label: 'Anytime' },
            { value: 'custom', label: 'Custom window' },
          ]}
        />
      </Field>

      {t.time_window === 'custom' ? (
        <Field label="Custom window" hint="When the agent is allowed to act">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <TimeInput
              value={t.custom_window.start}
              onChange={(v) => setCustomWindow('start', v)}
            />
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <TimeInput
              value={t.custom_window.end}
              onChange={(v) => setCustomWindow('end', v)}
            />
          </div>
        </Field>
      ) : null}

      <div
        className="cw-grid-2"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
      >
        <Field label="Cooldown between firings (same contact)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <NumberInput
              value={t.cooldown.value}
              onChange={(v) => setCooldown('value', v)}
              min={1}
            />
            <Select
              value={t.cooldown.unit}
              onChange={(v) => setCooldown('unit', v)}
              options={UNITS}
            />
          </div>
        </Field>
        <Field label="Max firings per day (org-wide)">
          <NumberInput
            value={t.max_daily_firings}
            onChange={(v) => set('max_daily_firings', v)}
            min={1}
          />
        </Field>
      </div>

      <style jsx>{`
        @media (max-width: 700px) {
          :global(.cw-grid-2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
