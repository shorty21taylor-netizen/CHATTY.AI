'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Home,
  Thermometer,
  Sun,
  PaintBucket,
  Hammer,
  Wrench,
  Plus,
  X,
  Rocket,
  Play,
  Phone,
  CalendarCheck,
  Moon,
  Building2,
  User,
  PhoneCall,
  MapPin,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Static config
// ---------------------------------------------------------------------------

const STEPS = [
  { id: 1, label: 'Business Info' },
  { id: 2, label: 'Industry' },
  { id: 3, label: 'Connect Sources' },
  { id: 4, label: 'Configure Agents' },
];

const INDUSTRIES = [
  {
    id: 'roofing',
    name: 'Roofing',
    tagline: 'Storm response, tear-offs, replacements.',
    icon: Home,
  },
  {
    id: 'hvac',
    name: 'HVAC',
    tagline: 'Installs, service, seasonal tune-ups.',
    icon: Thermometer,
  },
  {
    id: 'solar',
    name: 'Solar',
    tagline: 'Residential + commercial PV systems.',
    icon: Sun,
  },
  {
    id: 'exteriors',
    name: 'Exteriors',
    tagline: 'Siding, windows, gutters, paint.',
    icon: PaintBucket,
  },
  {
    id: 'remodeling',
    name: 'Remodeling',
    tagline: 'Kitchens, baths, full-home renovations.',
    icon: Hammer,
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    tagline: 'Repairs, re-pipes, water heaters.',
    icon: Wrench,
  },
];

const SOURCES = [
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Pull LSA + Search campaign signals.',
    color: '#4285F4',
    glyph: 'G',
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    description: 'Meta campaigns + lead form signals.',
    color: '#1877F2',
    glyph: 'f',
  },
  {
    id: 'gbp',
    name: 'Google Business Profile',
    description: 'Reviews, calls, and direction requests.',
    color: '#34A853',
    glyph: 'B',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Invoices, revenue, job margin.',
    color: '#2CA01C',
    glyph: 'Q',
  },
  {
    id: 'gmail',
    name: 'Email (Gmail)',
    description: 'Inbound customer emails + replies.',
    color: '#EA4335',
    glyph: 'M',
  },
  {
    id: 'phone',
    name: 'Phone System',
    description: 'Call logs + ElevenLabs call routing.',
    color: '#818cf8',
    glyph: '☎',
  },
];

const AGENT_TEMPLATES = [
  {
    id: 'inbound-sales-agent',
    name: 'Inbound Sales Agent',
    description:
      'Picks up every inbound call, qualifies intent, books inspections.',
    icon: PhoneCall,
    defaultEnabled: true,
  },
  {
    id: 'appointment-setter',
    name: 'Appointment Setter',
    description:
      'Outbound dialer that confirms appointments 24h ahead and reschedules.',
    icon: CalendarCheck,
    defaultEnabled: false,
  },
  {
    id: 'after-hours-responder',
    name: 'After-Hours Responder',
    description:
      'Answers calls between 6pm and 7am, captures the lead, texts the operator.',
    icon: Moon,
    defaultEnabled: false,
  },
];

const VOICE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'direct', label: 'Direct' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1 — Business Info
  const [company, setCompany] = useState('Summit Roofing Co.');
  const [owner, setOwner] = useState('Marcus Johnson');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [areas, setAreas] = useState(['Dallas', 'Fort Worth', 'Arlington']);
  const [newArea, setNewArea] = useState('');

  // Step 2 — Industry
  const [industries, setIndustries] = useState(['roofing']);

  // Step 3 — Sources
  const [connected, setConnected] = useState({
    'google-ads': true,
    gmail: true,
  });

  // Step 4 — Agents
  const [agents, setAgents] = useState(() =>
    Object.fromEntries(
      AGENT_TEMPLATES.map((a) => [
        a.id,
        { enabled: a.defaultEnabled, voice: 'friendly', testing: false },
      ])
    )
  );

  function goNext() {
    if (step < STEPS.length) {
      setDirection(1);
      setStep(step + 1);
    } else {
      router.push('/dashboard');
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  function addArea() {
    const value = newArea.trim();
    if (!value || areas.includes(value)) return;
    setAreas([...areas, value]);
    setNewArea('');
  }

  function removeArea(name) {
    setAreas(areas.filter((a) => a !== name));
  }

  function toggleIndustry(id) {
    setIndustries((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    );
  }

  function toggleSource(id) {
    setConnected((curr) => ({ ...curr, [id]: !curr[id] }));
  }

  function updateAgent(id, patch) {
    setAgents((curr) => ({ ...curr, [id]: { ...curr[id], ...patch } }));
  }

  function testAgentVoice(id) {
    updateAgent(id, { testing: true });
    setTimeout(() => updateAgent(id, { testing: false }), 2000);
  }

  const isLast = step === STEPS.length;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--app-bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'center',
        padding: '48px 24px 120px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 820 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            className="t-eyebrow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--emerald-bright)',
                boxShadow: '0 0 8px var(--emerald-glow)',
                display: 'inline-block',
              }}
            />
            Welcome to Chatty AI
          </div>
          <h1
            className="t-h1"
            style={{ margin: '10px 0 6px', letterSpacing: '-0.01em' }}
          >
            Let&apos;s set up your workspace.
          </h1>
          <p
            className="t-body"
            style={{ color: 'var(--text-muted)', margin: 0 }}
          >
            Four quick steps — about 3 minutes total.
          </p>
        </div>

        {/* Stepper */}
        <Stepper current={step} />

        {/* Step body */}
        <div
          className="dark-card"
          style={{
            padding: 0,
            marginTop: 28,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={(dir) => ({
                opacity: 0,
                x: dir > 0 ? 40 : -40,
              })}
              animate={{ opacity: 1, x: 0 }}
              exit={(dir) => ({
                opacity: 0,
                x: dir > 0 ? -40 : 40,
              })}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{ padding: 30 }}
            >
              {step === 1 ? (
                <StepBusiness
                  company={company}
                  setCompany={setCompany}
                  owner={owner}
                  setOwner={setOwner}
                  phone={phone}
                  setPhone={setPhone}
                  areas={areas}
                  removeArea={removeArea}
                  newArea={newArea}
                  setNewArea={setNewArea}
                  addArea={addArea}
                />
              ) : null}
              {step === 2 ? (
                <StepIndustry
                  industries={industries}
                  toggleIndustry={toggleIndustry}
                />
              ) : null}
              {step === 3 ? (
                <StepSources
                  connected={connected}
                  toggleSource={toggleSource}
                  onSkip={goNext}
                />
              ) : null}
              {step === 4 ? (
                <StepAgents
                  agents={agents}
                  updateAgent={updateAgent}
                  testAgentVoice={testAgentVoice}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav bar */}
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ flex: '0 0 auto' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : null}
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-subtle)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Step {step} of {STEPS.length}
          </div>

          <button
            type="button"
            onClick={goNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              borderRadius: 10,
              background: isLast
                ? 'linear-gradient(135deg, #10b981, #6366f1)'
                : 'var(--emerald-bright)',
              border: '1px solid var(--emerald-bright)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            {isLast ? (
              <>
                <Rocket size={14} fill="#ffffff" /> Launch Chatty AI
              </>
            ) : (
              <>
                Continue <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ current }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
        gap: 0,
        padding: '0 6px',
      }}
    >
      {STEPS.map((s, i) => {
        const isDone = current > s.id;
        const isActive = current === s.id;
        const isUpcoming = current < s.id;
        return (
          <div
            key={s.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Connector line */}
            {i < STEPS.length - 1 ? (
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  left: '62%',
                  right: '-38%',
                  height: 2,
                  background: isDone
                    ? 'var(--emerald-bright)'
                    : 'var(--border)',
                  zIndex: 0,
                }}
              />
            ) : null}

            {/* Circle */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isDone
                  ? 'var(--emerald-bright)'
                  : isActive
                    ? 'var(--emerald-bright)'
                    : 'var(--surface-1)',
                border:
                  '2px solid ' +
                  (isUpcoming ? 'var(--border-strong)' : 'var(--emerald-bright)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                color: isUpcoming
                  ? 'var(--text-subtle)'
                  : '#ffffff',
                position: 'relative',
                zIndex: 1,
                boxShadow: isActive
                  ? '0 0 0 4px rgba(16,185,129,0.15)'
                  : 'none',
              }}
            >
              {isDone ? (
                <Check size={16} />
              ) : isActive ? (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {s.id}
                </motion.span>
              ) : (
                s.id
              )}
              {isActive ? (
                <motion.span
                  style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: '2px solid var(--emerald-bright)',
                    pointerEvents: 'none',
                  }}
                  animate={{ opacity: [0.5, 0.1, 0.5], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ) : null}
            </div>

            {/* Label */}
            <div
              style={{
                marginTop: 10,
                fontSize: 11.5,
                fontWeight: 600,
                textAlign: 'center',
                color: isUpcoming ? 'var(--text-subtle)' : 'var(--text-bright)',
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Business Info
// ---------------------------------------------------------------------------

function StepBusiness({
  company,
  setCompany,
  owner,
  setOwner,
  phone,
  setPhone,
  areas,
  removeArea,
  newArea,
  setNewArea,
  addArea,
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 1"
        title="Tell us about your business"
        description="Just the basics — we'll use this to personalize every brief."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 8,
        }}
      >
        <Field label="Company name" icon={Building2}>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={inputStyle()}
          />
        </Field>
        <Field label="Owner name" icon={User}>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            style={inputStyle()}
          />
        </Field>
        <Field label="Business phone" icon={PhoneCall}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle()}
          />
        </Field>
      </div>

      <div style={{ marginTop: 18 }}>
        <Field label="Service area" icon={MapPin}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: 10,
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            {areas.map((area) => (
              <span
                key={area}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'var(--emerald-tint)',
                  color: 'var(--emerald-bright)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
              >
                {area}
                <button
                  type="button"
                  onClick={() => removeArea(area)}
                  aria-label={`Remove ${area}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--emerald-bright)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <input
                type="text"
                value={newArea}
                placeholder="Add area…"
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArea();
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-bright)',
                  fontSize: 13,
                  minWidth: 120,
                }}
              />
              <button
                type="button"
                onClick={addArea}
                disabled={!newArea.trim()}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: newArea.trim()
                    ? 'var(--emerald-bright)'
                    : 'var(--surface-3)',
                  border: 'none',
                  color: newArea.trim() ? '#ffffff' : 'var(--text-subtle)',
                  cursor: newArea.trim() ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </Field>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Industry
// ---------------------------------------------------------------------------

function StepIndustry({ industries, toggleIndustry }) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 2"
        title="What do you do?"
        description="Pick one or more. Chatty tunes its playbooks per vertical."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 10,
        }}
      >
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          const selected = industries.includes(ind.id);
          return (
            <button
              key={ind.id}
              type="button"
              onClick={() => toggleIndustry(ind.id)}
              style={{
                position: 'relative',
                padding: 18,
                borderRadius: 14,
                background: selected
                  ? 'rgba(16,185,129,0.08)'
                  : 'var(--surface-2)',
                border: selected
                  ? '1px solid var(--emerald-bright)'
                  : '1px solid var(--border)',
                boxShadow: selected
                  ? '0 0 0 3px rgba(16,185,129,0.14), 0 6px 18px rgba(16,185,129,0.12)'
                  : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
                transition: 'all .15s',
                minHeight: 126,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {selected ? (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--emerald-bright)',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={12} />
                </span>
              ) : null}
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: selected
                    ? 'var(--emerald-bright)'
                    : 'var(--surface-3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: selected ? '#ffffff' : 'var(--text-muted)',
                  }}
                />
              </span>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: selected ? 'var(--emerald-bright)' : 'var(--text-bright)',
                  marginBottom: 4,
                }}
              >
                {ind.name}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {ind.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Sources
// ---------------------------------------------------------------------------

function StepSources({ connected, toggleSource, onSkip }) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 3"
        title="Connect your sources"
        description="Every connection is an extra signal Chatty can reason over."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginTop: 10,
        }}
      >
        {SOURCES.map((src) => {
          const isOn = !!connected[src.id];
          return (
            <div
              key={src.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'var(--surface-2)',
                border: isOn
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${src.color}22`,
                  border: `1px solid ${src.color}44`,
                  color: src.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {src.glyph}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--text-bright)',
                  }}
                >
                  {src.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  {src.description}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSource(src.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all .15s',
                  ...(isOn
                    ? {
                        background: 'var(--emerald-bright)',
                        color: '#ffffff',
                        border: '1px solid var(--emerald-bright)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--text-bright)',
                        border: '1px solid var(--border-strong)',
                      }),
                }}
              >
                {isOn ? (
                  <>
                    <Check size={12} /> Connected
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div
          className="t-body-sm"
          style={{ color: 'var(--text-subtle)' }}
        >
          You can always add more integrations later from Settings.
        </div>
        <button
          type="button"
          onClick={onSkip}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Agents
// ---------------------------------------------------------------------------

function StepAgents({ agents, updateAgent, testAgentVoice }) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 4"
        title="Choose your voice agents"
        description="Toggle on the agents you want live from day one. You can refine settings later."
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 10,
        }}
      >
        {AGENT_TEMPLATES.map((a) => {
          const state = agents[a.id];
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 12,
                background: 'var(--surface-2)',
                border: state.enabled
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid var(--border)',
                opacity: state.enabled ? 1 : 0.72,
                transition: 'all .15s',
              }}
            >
              <Toggle
                on={state.enabled}
                onChange={() =>
                  updateAgent(a.id, { enabled: !state.enabled })
                }
              />
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: state.enabled
                    ? 'var(--emerald-tint)'
                    : 'var(--surface-3)',
                  border: state.enabled
                    ? '1px solid rgba(16,185,129,0.25)'
                    : '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={16}
                  style={{
                    color: state.enabled
                      ? 'var(--emerald-bright)'
                      : 'var(--text-muted)',
                  }}
                />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--text-bright)',
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  {a.description}
                </div>
              </div>
              <select
                value={state.voice}
                onChange={(e) => updateAgent(a.id, { voice: e.target.value })}
                disabled={!state.enabled}
                style={{ minWidth: 130, maxWidth: 150 }}
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => testAgentVoice(a.id)}
                disabled={!state.enabled || state.testing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 11px',
                  borderRadius: 8,
                  background: state.testing
                    ? 'transparent'
                    : state.enabled
                      ? 'var(--emerald-tint)'
                      : 'var(--surface-3)',
                  color: state.enabled
                    ? 'var(--emerald-bright)'
                    : 'var(--text-subtle)',
                  border:
                    '1px solid ' +
                    (state.enabled
                      ? 'rgba(16,185,129,0.3)'
                      : 'var(--border)'),
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: state.enabled ? 'pointer' : 'default',
                  minWidth: 88,
                  justifyContent: 'center',
                }}
              >
                {state.testing ? (
                  <TestingPulse />
                ) : (
                  <>
                    <Play size={11} /> Test
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function StepHeader({ eyebrow, title, description }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="t-eyebrow">{eyebrow}</div>
      <h2 className="t-h2" style={{ margin: '4px 0 4px' }}>
        {title}
      </h2>
      <p className="t-body-sm" style={{ color: 'var(--text-muted)', margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontSize: 11.5,
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {Icon ? <Icon size={11} /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function inputStyle() {
  return {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text-bright)',
    fontSize: 13.5,
    fontWeight: 500,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color .15s, box-shadow .15s',
  };
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: on ? 'var(--emerald-bright)' : 'var(--surface-3)',
        border: '1px solid ' + (on ? 'var(--emerald-bright)' : 'var(--border)'),
        position: 'relative',
        cursor: 'pointer',
        padding: 0,
        transition: 'background .15s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
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
        gap: 3,
        height: 12,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          style={{
            width: 2.5,
            borderRadius: 2,
            background: 'var(--emerald-bright)',
          }}
          animate={{ height: [5, 12, 5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}
