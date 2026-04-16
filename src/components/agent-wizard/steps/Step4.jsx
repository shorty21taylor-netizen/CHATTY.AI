'use client';

import { useMemo } from 'react';
import {
  Field,
  RadioGroup,
  Slider,
} from '@/components/agent/FormPrimitives';

// Simple deterministic sample generator — not a real model, just enough to
// show the slider positions change the output visibly.
function sampleMessage({ formality, verbosity, warmth }, idx, ownerName = 'Marcus') {
  const casual = formality >= 6;
  const detailed = verbosity >= 6;
  const direct = warmth >= 6;

  const openings = [
    casual ? `Hey! ${ownerName} here —` : `Hello, this is ${ownerName} with the team.`,
    casual ? 'Just saw you reached out —' : 'Thank you for reaching out to us.',
    casual ? 'Got your message!' : 'We received your inquiry.',
  ];
  const middles = [
    detailed
      ? 'Based on what you shared, we can absolutely help. We serve the whole metro, do free inspections, and most jobs wrap in 1–2 days.'
      : 'We can help with this.',
    detailed
      ? "I'd love to run through a couple quick questions so we can get you the most accurate quote — takes about 60 seconds."
      : 'Quick 60-second intake?',
    detailed
      ? 'We keep it simple: inspection today or tomorrow, quote within 24 hours, no pressure.'
      : 'Inspection, then quote.',
  ];
  const closings = [
    direct ? 'What time tomorrow works?' : 'Whenever you have a moment, just let me know what time might work.',
    direct ? 'Reply with a window and we’re set.' : 'Just reply with a time window that suits you and we’ll take it from there.',
    direct ? 'Pick a time that works.' : 'Take your time — just let me know when.',
  ];
  return `${openings[idx]} ${middles[idx]} ${closings[idx]}`;
}

export default function Step4Voice({ config, businessProfile, updateConfig }) {
  const v = config.voice;

  function set(key, value) {
    updateConfig((c) => ({
      ...c,
      voice: { ...c.voice, [key]: value },
    }));
  }

  const effective = useMemo(() => {
    if (v.mode === 'inherit' && businessProfile) {
      return {
        formality: businessProfile.voice_formality,
        verbosity: businessProfile.voice_verbosity,
        warmth: businessProfile.voice_warmth,
      };
    }
    return {
      formality: v.formality,
      verbosity: v.verbosity,
      warmth: v.warmth,
    };
  }, [v, businessProfile]);

  const ownerName = businessProfile?.owner_first_name || 'Marcus';

  const samples = useMemo(() => {
    return [0, 1, 2].map((i) => sampleMessage(effective, i, ownerName));
  }, [effective, ownerName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Decide whether this agent should sound like the rest of your business
        (recommended) or take its own tone.
      </p>

      <Field label="Voice mode">
        <RadioGroup
          value={v.mode}
          onChange={(val) => set('mode', val)}
          options={[
            { value: 'inherit', label: 'Inherit from Business Profile' },
            { value: 'custom', label: 'Customize for this agent' },
          ]}
        />
      </Field>

      {v.mode === 'custom' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: 16,
            borderRadius: 10,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          <Slider
            value={v.formality}
            onChange={(val) => set('formality', val)}
            leftLabel="Formal"
            rightLabel="Casual"
          />
          <Slider
            value={v.verbosity}
            onChange={(val) => set('verbosity', val)}
            leftLabel="Concise"
            rightLabel="Detailed"
          />
          <Slider
            value={v.warmth}
            onChange={(val) => set('warmth', val)}
            leftLabel="Warm"
            rightLabel="Direct"
          />
        </div>
      ) : null}

      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Live preview — 3 sample messages
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {samples.map((s, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface-1)',
                fontSize: 13,
                color: 'var(--text-body)',
                lineHeight: 1.55,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  marginRight: 8,
                  padding: '1px 6px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  borderRadius: 4,
                  background:
                    'color-mix(in srgb, var(--primary) 14%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                SAMPLE {i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
