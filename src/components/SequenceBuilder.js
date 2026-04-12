'use client';

import { useState } from 'react';
import { Mic, MessageSquare, Trash2 } from 'lucide-react';

const DEFAULT_SEQUENCE = [
  { id: 1, day: 0, type: 'sms', body: "Hey {firstName}, still thinking about that {jobType}?", on: true },
  { id: 2, day: 3, type: 'voice', body: '45-second voice note', on: true, durationSec: 45 },
  { id: 3, day: 7, type: 'sms', body: 'Happy to re-quote — prices have moved.', on: true },
  { id: 4, day: 14, type: 'voice', body: '30-second final touch', on: true, durationSec: 30 },
  { id: 5, day: 21, type: 'sms', body: "Closing your file unless I hear back.", on: true },
];

export function SequenceBuilder({ initial = DEFAULT_SEQUENCE }) {
  const [steps, setSteps] = useState(initial);

  function toggleOn(id) {
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, on: !step.on } : step)));
  }
  function swapType(id) {
    setSteps((s) =>
      s.map((step) =>
        step.id === id ? { ...step, type: step.type === 'sms' ? 'voice' : 'sms' } : step
      )
    );
  }
  function updateBody(id, body) {
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, body } : step)));
  }
  function removeStep(id) {
    setSteps((s) => s.filter((step) => step.id !== id));
  }

  return (
    <div className="dark-card" style={{ padding: 26 }}>
      <div style={{ marginBottom: 18 }}>
        <div className="t-h2" style={{ marginBottom: 4 }}>
          Sequence timeline
        </div>
        <div className="t-body-sm">
          Toggle each step on/off, edit copy, and swap SMS {'\u2194'} Voice Note at any step.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step) => {
          const isVoice = step.type === 'voice';
          return (
            <div
              key={step.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 38px 1fr auto',
                gap: 14,
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 12,
                background: step.on ? 'var(--surface-2)' : 'transparent',
                border: '1px solid var(--border)',
                opacity: step.on ? 1 : 0.55,
                transition: 'opacity .15s',
              }}
            >
              {/* Day */}
              <div>
                <div className="t-eyebrow">Day</div>
                <div
                  className="t-mono"
                  style={{ fontSize: 16, color: 'var(--text-bright)', marginTop: 2, fontWeight: 600 }}
                >
                  {step.day}
                </div>
              </div>

              {/* Type badge (clickable to swap) */}
              <button
                type="button"
                onClick={() => swapType(step.id)}
                title="Swap SMS ↔ Voice Note"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--emerald-tint)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: 'var(--emerald-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isVoice ? <Mic size={15} /> : <MessageSquare size={15} />}
              </button>

              {/* Body */}
              <div>
                <div className="t-eyebrow" style={{ marginBottom: 4 }}>
                  {isVoice ? 'Voice note' : 'SMS'}
                </div>
                <input
                  type="text"
                  value={step.body}
                  onChange={(e) => updateBody(step.id, e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Right: toggle + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={step.on}
                  onClick={() => toggleOn(step.id)}
                  style={{
                    width: 38,
                    height: 22,
                    borderRadius: 999,
                    background: step.on ? 'var(--emerald-bright)' : 'var(--surface-3)',
                    border: '1px solid ' + (step.on ? 'var(--emerald-bright)' : 'var(--border)'),
                    position: 'relative',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: step.on ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#ffffff',
                      transition: 'left .15s',
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  aria-label="Remove step"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
