'use client';

import { useState } from 'react';
import { Mic, Play } from 'lucide-react';
import { VOICE_OPTIONS } from '@/lib/voiceNotes';

export function VoiceNoteCard({ defaultScript = '', defaultVoiceId = 'mike-warm' }) {
  const [enabled, setEnabled] = useState(true);
  const [voiceId, setVoiceId] = useState(defaultVoiceId);
  const [script, setScript] = useState(defaultScript);
  const [previewMsg, setPreviewMsg] = useState('');

  function handlePreview() {
    setPreviewMsg('Preview available once ElevenLabs is connected.');
    setTimeout(() => setPreviewMsg(''), 3200);
  }

  return (
    <div
      className="glow-card glow-border"
      style={{
        padding: 26,
        marginBottom: 22,
        boxShadow: '0 0 40px rgba(212,255,79,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'rgba(212,255,79,0.12)',
              border: '1px solid rgba(212,255,79,0.3)',
              color: '#d4ff4f',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <Mic size={10} /> Voice Notes
          </span>
          <div className="t-h2" style={{ marginBottom: 4 }}>
            AI voice notes
          </div>
          <p className="t-body-sm" style={{ margin: 0, maxWidth: 520 }}>
            Send 15–45 second personalized voice messages in place of plain SMS. Reply rates run 3–5&times; higher because they feel personal.
          </p>
        </div>

        {/* Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          style={{
            width: 44,
            height: 26,
            borderRadius: 999,
            background: enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-3)',
            border: '1px solid ' + (enabled ? 'var(--emerald-bright)' : 'var(--dark-border)'),
            position: 'relative',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 2,
              left: enabled ? 20 : 2,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: enabled ? '#06140e' : '#8a9290',
              transition: 'left .15s',
            }}
          />
        </button>
      </div>

      {/* Voice selector */}
      <div style={{ marginBottom: 16 }}>
        <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
          Voice
        </label>
        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          disabled={!enabled}
          style={{ width: '100%', opacity: enabled ? 1 : 0.5 }}
        >
          {VOICE_OPTIONS.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Script */}
      <div style={{ marginBottom: 16 }}>
        <label className="t-eyebrow" style={{ display: 'block', marginBottom: 6 }}>
          Script
        </label>
        <textarea
          rows={5}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          disabled={!enabled}
          placeholder={'Use placeholders like {firstName}, {companyName}, {jobType}.'}
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', opacity: enabled ? 1 : 0.5 }}
        />
        <div className="t-body-sm" style={{ marginTop: 6 }}>
          Placeholders:{' '}
          <code className="t-mono">{'{firstName}'}</code>,{' '}
          <code className="t-mono">{'{companyName}'}</code>,{' '}
          <code className="t-mono">{'{jobType}'}</code>
        </div>
      </div>

      {/* Preview + stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          paddingTop: 16,
          borderTop: '1px solid var(--dark-border)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={handlePreview}
          disabled={!enabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 10,
            background: 'var(--emerald-bright)',
            color: '#06140e',
            border: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: enabled ? 'pointer' : 'not-allowed',
            opacity: enabled ? 1 : 0.5,
            boxShadow: enabled ? '0 0 16px var(--emerald-glow)' : 'none',
          }}
        >
          <Play size={13} /> Preview voice note
        </button>

        <div style={{ display: 'flex', gap: 22 }}>
          <Stat label="Sent this month" value="247" />
          <Stat label="Reply rate" value="34%" highlight />
        </div>
      </div>

      {previewMsg ? (
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(201,169,97,0.08)',
            border: '1px solid rgba(201,169,97,0.25)',
            color: '#c9a961',
            fontSize: 13,
          }}
        >
          {previewMsg}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="t-eyebrow">{label}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: highlight ? 'var(--emerald-bright)' : 'var(--text-bright)',
          fontVariantNumeric: 'tabular-nums',
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}
