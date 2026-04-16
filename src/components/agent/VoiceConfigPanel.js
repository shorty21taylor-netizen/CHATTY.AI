'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Mic,
  Play,
  Volume2,
  UserCircle,
  Smile,
  Zap,
  Clock,
  PhoneCall,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';

/**
 * VoiceConfigPanel — collapsible configuration surface for an ElevenLabs voice agent.
 *
 * All state is local (useState). No network calls are wired yet; the "Test Voice"
 * button shows a pulsing placeholder animation for now.
 */

const PRESET_VOICES = [
  { id: 'rachel', name: 'Rachel', tag: 'Warm · Female · US', sample: '29 yo, calm energy' },
  { id: 'drew', name: 'Drew', tag: 'Confident · Male · US', sample: '36 yo, sales veteran' },
  { id: 'clyde', name: 'Clyde', tag: 'Authoritative · Male · US', sample: '44 yo, trusted advisor' },
  { id: 'dorothy', name: 'Dorothy', tag: 'Friendly · Female · UK', sample: '31 yo, polished' },
  { id: 'elli', name: 'Elli', tag: 'Young · Female · US', sample: '26 yo, upbeat' },
  { id: 'adam', name: 'Adam', tag: 'Deep · Male · US', sample: '40 yo, broadcast tone' },
];

const PERSONALITIES = [
  {
    id: 'professional',
    name: 'Professional',
    icon: UserCircle,
    description: 'Buttoned-up, concise, respects the caller\'s time.',
  },
  {
    id: 'friendly',
    name: 'Friendly',
    icon: Smile,
    description: 'Warm and conversational. Great for first-touch intake.',
  },
  {
    id: 'direct',
    name: 'Direct',
    icon: Zap,
    description: 'Moves fast, closes fast. Best for qualified follow-ups.',
  },
];

const CALL_TOGGLES = [
  { id: 'record', label: 'Record Calls', icon: Mic, default: true },
  { id: 'transcribe', label: 'Transcribe Calls', icon: FileText, default: true },
  { id: 'followupSms', label: 'Auto Follow-Up SMS', icon: MessageSquare, default: true },
  { id: 'businessHoursOnly', label: 'Business Hours Only', icon: Shield, default: false },
];

export function VoiceConfigPanel({ defaultOpen = false, agentName = 'Voice Agent' }) {
  const [open, setOpen] = useState(defaultOpen);
  const [voice, setVoice] = useState('rachel');
  const [greeting, setGreeting] = useState(
    `Hi, thanks for calling ${agentName}. I'm the AI assistant — I can help you get a quote, book an appointment, or transfer you to the team. What can I do for you today?`
  );
  const [personality, setPersonality] = useState('friendly');
  const [toggles, setToggles] = useState(
    Object.fromEntries(CALL_TOGGLES.map((t) => [t.id, t.default]))
  );
  const [hours, setHours] = useState({ start: '08:00', end: '18:00' });
  const [testing, setTesting] = useState(false);

  function handleTestVoice() {
    if (testing) return;
    setTesting(true);
    setTimeout(() => setTesting(false), 2400);
  }

  return (
    <div
      className="dark-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: 16,
      }}
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--primary-tint)',
            border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Volume2 size={16} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-h3" style={{ marginBottom: 2 }}>
            Voice Configuration
          </div>
          <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
            ElevenLabs voice, personality, and call handling
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '8px 20px 22px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 26,
              }}
            >
              {/* 1. Voice Selection */}
              <Section
                eyebrow="Step 1"
                title="Voice"
                description="Pick the voice your agent will use on calls."
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {PRESET_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.tag}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="t-body-sm"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: '1px dashed rgba(16,185,129,0.45)',
                      background: 'var(--primary-tint)',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    title="Coming soon: clone your own voice in ElevenLabs Voice Lab"
                  >
                    <Sparkles size={13} /> Clone My Voice
                  </button>
                </div>
                <VoicePreviewRow voice={PRESET_VOICES.find((v) => v.id === voice)} />
              </Section>

              {/* 2. Greeting */}
              <Section
                eyebrow="Step 2"
                title="Greeting"
                description="What the agent says as soon as it picks up."
              >
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                  }}
                />
                <div
                  className="t-body-sm"
                  style={{
                    color: 'var(--text-subtle)',
                    marginTop: 6,
                    textAlign: 'right',
                  }}
                >
                  {greeting.length} chars
                </div>
              </Section>

              {/* 3. Personality */}
              <Section
                eyebrow="Step 3"
                title="Personality"
                description="Sets tone, pacing, and word choice."
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                  }}
                >
                  {PERSONALITIES.map((p) => {
                    const Icon = p.icon;
                    const active = personality === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersonality(p.id)}
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          border: active
                            ? '1px solid var(--primary)'
                            : '1px solid var(--border)',
                          background: active ? 'var(--primary-tint)' : 'var(--surface-2)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all .15s',
                          color: 'inherit',
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: active
                              ? 'var(--primary)'
                              : 'var(--surface-3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                          }}
                        >
                          <Icon
                            size={15}
                            style={{
                              color: active ? '#ffffff' : 'var(--text-muted)',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: active ? 'var(--primary)' : 'var(--text-bright)',
                            marginBottom: 4,
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                          }}
                        >
                          {p.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* 4. Call Handling */}
              <Section
                eyebrow="Step 4"
                title="Call Handling"
                description="What happens during and after every call."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CALL_TOGGLES.map((t) => {
                    const Icon = t.icon;
                    const on = toggles[t.id];
                    return (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 10,
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Icon
                          size={14}
                          style={{
                            color: on
                              ? 'var(--primary)'
                              : 'var(--text-subtle)',
                          }}
                        />
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
                          {t.label}
                        </div>
                        <Toggle
                          on={on}
                          onChange={() =>
                            setToggles((prev) => ({ ...prev, [t.id]: !prev[t.id] }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* 5. Business Hours */}
              <Section
                eyebrow="Step 5"
                title="Business Hours"
                description="Agent answers only between these times when enabled."
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) =>
                      setHours((h) => ({ ...h, start: e.target.value }))
                    }
                    style={{ maxWidth: 130 }}
                  />
                  <span className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
                    to
                  </span>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => setHours((h) => ({ ...h, end: e.target.value }))}
                    style={{ maxWidth: 130 }}
                  />
                  <span
                    className="t-body-sm"
                    style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }}
                  >
                    Local time
                  </span>
                </div>
              </Section>

              {/* 6. Test voice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderTop: '1px dashed var(--border)',
                  paddingTop: 18,
                }}
              >
                <div>
                  <div className="t-h3" style={{ marginBottom: 2 }}>
                    Preview on a live call
                  </div>
                  <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
                    Plays a 6-second synthesized sample of the selected voice.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={testing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--primary)',
                    background: testing
                      ? 'transparent'
                      : 'var(--primary)',
                    color: testing ? 'var(--primary)' : '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: testing ? 'default' : 'pointer',
                    transition: 'all .15s',
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: 140,
                    justifyContent: 'center',
                  }}
                >
                  {testing ? (
                    <TestingPulse />
                  ) : (
                    <>
                      <Play size={14} fill="#fff" /> Test Voice
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Section({ eyebrow, title, description, children }) {
  return (
    <div>
      <div className="t-eyebrow" style={{ marginBottom: 4 }}>
        {eyebrow}
      </div>
      <div className="t-h3" style={{ marginBottom: 4 }}>
        {title}
      </div>
      <p
        className="t-body-sm"
        style={{ color: 'var(--text-muted)', margin: '0 0 12px' }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}

function VoicePreviewRow({ voice }) {
  if (!voice) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {voice.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{voice.name}</div>
        <div className="t-body-sm" style={{ color: 'var(--text-muted)' }}>
          {voice.sample} · {voice.tag}
        </div>
      </div>
      <PhoneCall size={13} style={{ color: 'var(--text-subtle)' }} />
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        background: on ? 'var(--primary)' : 'var(--surface-3)',
        border: '1px solid ' + (on ? 'var(--primary)' : 'var(--border)'),
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        transition: 'background .15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 1,
          left: on ? 17 : 1,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'left .15s',
        }}
      />
    </button>
  );
}

function TestingPulse() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 14,
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: 'var(--primary)',
          }}
          animate={{ height: [6, 14, 6] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span style={{ marginLeft: 6, fontSize: 12.5 }}>Playing sample…</span>
    </span>
  );
}
