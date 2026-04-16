'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { WIZARD_STEPS, getAgentById } from '@/lib/agents/registry';
import {
  loadAgentConfig,
  saveAgentConfig,
  loadBusinessProfile,
  businessProfileStatus,
} from '@/lib/agents/storage';

import Step1Mission from '@/components/agent-wizard/steps/Step1';
import Step2Triggers from '@/components/agent-wizard/steps/Step2';
import Step3Context from '@/components/agent-wizard/steps/Step3';
import Step4Voice from '@/components/agent-wizard/steps/Step4';
import Step5Templates from '@/components/agent-wizard/steps/Step5';
import Step6Knowledge from '@/components/agent-wizard/steps/Step6';
import Step7Tools from '@/components/agent-wizard/steps/Step7';
import Step8Guardrails from '@/components/agent-wizard/steps/Step8';
import Step9Escalation from '@/components/agent-wizard/steps/Step9';
import Step10Simulation from '@/components/agent-wizard/steps/Step10';
import Step11Activation from '@/components/agent-wizard/steps/Step11';

const STEP_COMPONENTS = {
  mission: Step1Mission,
  triggers: Step2Triggers,
  context: Step3Context,
  voice: Step4Voice,
  templates: Step5Templates,
  knowledge: Step6Knowledge,
  tools: Step7Tools,
  guardrails: Step8Guardrails,
  escalation: Step9Escalation,
  simulation: Step10Simulation,
  activation: Step11Activation,
};

export default function ConfigureAgentPage({ params }) {
  const { id } = use(params);
  const agent = getAgentById(id);
  if (!agent) return notFound();

  const [hydrated, setHydrated] = useState(false);
  const [config, setConfig] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const c = loadAgentConfig(id);
    setConfig(c);
    setBusinessProfile(loadBusinessProfile());
    setHydrated(true);
  }, [id]);

  const step = useMemo(
    () => WIZARD_STEPS.find((s) => s.id === currentStep),
    [currentStep]
  );

  const bpStatus = useMemo(
    () => (businessProfile ? businessProfileStatus(businessProfile) : null),
    [businessProfile]
  );

  if (!hydrated || !config) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
    );
  }

  function updateConfig(updater) {
    setConfig((c) => {
      const next = typeof updater === 'function' ? updater(c) : updater;
      return next;
    });
  }

  function markStepComplete(stepKey, complete = true) {
    setConfig((c) => ({
      ...c,
      completeness: { ...(c.completeness || {}), [stepKey]: complete },
    }));
  }

  function persist(cfg) {
    saveAgentConfig(id, cfg);
    setSavedAt(new Date());
    setTimeout(() => setSavedAt(null), 2800);
  }

  function handleSaveDraft() {
    const next = { ...config, status: config.status === 'not_configured' ? 'draft' : config.status };
    setConfig(next);
    persist(next);
  }

  function handleNext() {
    markStepComplete(step.key, true);
    const updated = {
      ...config,
      completeness: { ...(config.completeness || {}), [step.key]: true },
      status: config.status === 'not_configured' ? 'draft' : config.status,
    };
    setConfig(updated);
    persist(updated);
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const completedCount = WIZARD_STEPS.filter(
    (s) => config.completeness?.[s.key]
  ).length;
  const completeness = Math.round(
    (completedCount / WIZARD_STEPS.length) * 100
  );

  const Icon = agent.icon;
  const StepComponent = STEP_COMPONENTS[step.key];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <Link
        href={`/dashboard/agents/${id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={14} /> Back to {agent.name}
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 11,
              background: `color-mix(in srgb, ${agent.color} 18%, transparent)`,
              color: agent.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--text-muted)' }}>
              Configure agent
            </div>
            <h1
              className="t-h1"
              style={{
                margin: '4px 0 0',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '-0.01em',
              }}
            >
              {agent.name}
            </h1>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            {completedCount} of {WIZARD_STEPS.length} steps
          </span>
          <div
            style={{
              width: 140,
              height: 6,
              borderRadius: 999,
              background: 'var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completeness}%`,
                height: '100%',
                background: 'var(--emerald-bright)',
                transition: 'width 160ms ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: 'var(--emerald-bright)',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {completeness}%
          </span>
        </div>
      </div>

      {bpStatus && !bpStatus.complete ? (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid color-mix(in srgb, #f59e0b 40%, var(--border))',
            background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
            color: '#f59e0b',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={14} />
          Business Profile is incomplete ({bpStatus.sectionsComplete}/
          {bpStatus.totalSections}). Finish it before activating.{' '}
          <Link
            href="/dashboard/business-profile"
            style={{
              color: '#f59e0b',
              fontWeight: 700,
              textDecoration: 'underline',
            }}
          >
            Complete profile →
          </Link>
        </div>
      ) : null}

      {/* Main layout: left rail + content */}
      <div
        className="cw-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: 24,
          marginTop: 24,
        }}
      >
        {/* Left rail */}
        <aside>
          <div
            className="dark-card"
            style={{
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              position: 'sticky',
              top: 20,
            }}
          >
            {WIZARD_STEPS.map((s) => {
              const isCurrent = s.id === currentStep;
              const isDone = !!config.completeness?.[s.key];
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    background: isCurrent
                      ? 'color-mix(in srgb, var(--emerald-bright) 12%, transparent)'
                      : 'transparent',
                    border: isCurrent
                      ? '1px solid color-mix(in srgb, var(--emerald-bright) 40%, var(--border))'
                      : '1px solid transparent',
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isCurrent ? 'var(--text-bright)' : 'var(--text-body)',
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      background: isDone
                        ? 'var(--emerald-bright)'
                        : isCurrent
                        ? 'color-mix(in srgb, var(--emerald-bright) 20%, transparent)'
                        : 'var(--surface-2)',
                      color: isDone ? '#fff' : isCurrent ? 'var(--emerald-bright)' : 'var(--text-muted)',
                      border: `1px solid ${
                        isDone
                          ? 'var(--emerald-bright)'
                          : isCurrent
                          ? 'color-mix(in srgb, var(--emerald-bright) 40%, var(--border))'
                          : 'var(--border)'
                      }`,
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : s.id}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content panel */}
        <section>
          <div
            className="dark-card"
            style={{
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--text-muted)' }}>
                Step {step.id} of {WIZARD_STEPS.length}
              </div>
              <h2
                className="t-h2"
                style={{ margin: '4px 0 0', letterSpacing: '-0.01em' }}
              >
                {step.label}
              </h2>
            </div>

            <StepComponent
              agent={agent}
              config={config}
              businessProfile={businessProfile}
              updateConfig={updateConfig}
            />
          </div>
        </section>
      </div>

      {/* Sticky bottom bar */}
      <div
        style={{
          position: 'sticky',
          bottom: 16,
          marginTop: 24,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface-1)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Step {step.id} · {step.label}
          </span>
          {savedAt ? (
            <span
              style={{
                color: 'var(--emerald-bright)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Check size={12} /> Draft saved
            </span>
          ) : null}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid var(--border)',
              background: 'transparent',
              borderRadius: 8,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              color: currentStep === 1 ? 'var(--text-muted)' : 'var(--text-body)',
              opacity: currentStep === 1 ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            style={{
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--text-body)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Save size={14} /> Save Draft
          </button>
          {currentStep < WIZARD_STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          :global(.cw-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
