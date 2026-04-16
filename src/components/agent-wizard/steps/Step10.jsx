'use client';

import { useState } from 'react';
import {
  Play,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Sparkles,
} from 'lucide-react';

// Stub scenario data — future Claude will actually role-play these.
function buildScenarioDetail(agent, scenario) {
  return {
    lead_name: 'Sample Lead',
    source: 'Google Ads',
    message: `Example ${scenario} inbound message for ${agent.name}.`,
    notes:
      'In production, this scenario would be role-played by Claude with the full agent config applied.',
  };
}

function buildExpectedOutput(agent, scenario, config) {
  const isCasual = (config?.voice?.formality ?? 5) >= 6;
  const opener = isCasual ? 'Hey' : 'Hello';
  return {
    draft: `${opener} — this is a sample draft the ${agent.name} agent would send for the "${scenario}" scenario. The real one will use your templates, voice, and knowledge base.`,
    tools: ['send_sms', 'tag_contact', 'update_contact_status'],
  };
}

export default function Step10Simulation({ agent, config, updateConfig }) {
  const scenarios = agent.simulationScenarios || [];
  const passed = config.simulation?.passed || {};
  const [expanded, setExpanded] = useState(null);
  const [runs, setRuns] = useState(config.simulation?.runs || {});

  function markScenario(name, result) {
    const nextPassed = { ...passed, [name]: result === 'pass' };
    const nextRuns = {
      ...runs,
      [name]: {
        ...(runs[name] || {}),
        result,
        at: new Date().toISOString(),
      },
    };
    setRuns(nextRuns);
    updateConfig((c) => ({
      ...c,
      simulation: {
        ...(c.simulation || {}),
        passed: nextPassed,
        runs: nextRuns,
      },
    }));
  }

  function runScenario(name) {
    setExpanded(name);
    if (!runs[name]) {
      const output = buildExpectedOutput(agent, name, config);
      const nextRuns = {
        ...runs,
        [name]: { output, at: new Date().toISOString() },
      };
      setRuns(nextRuns);
      updateConfig((c) => ({
        ...c,
        simulation: {
          ...(c.simulation || {}),
          passed: c.simulation?.passed || {},
          runs: nextRuns,
        },
      }));
    }
  }

  function runAll() {
    scenarios.forEach((s) => {
      if (!runs[s]) runScenario(s);
    });
  }

  const passedCount = scenarios.filter((s) => passed[s]).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
        Stress-test the agent on 5 realistic scenarios. You need 4 of 5 to pass
        before activation unlocks.
      </p>

      {/* Scoring strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: 14,
          borderRadius: 10,
          border: `1px solid ${
            passedCount >= 4
              ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
              : 'var(--border)'
          }`,
          background:
            passedCount >= 4
              ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
              : 'var(--surface-2)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color:
                passedCount >= 4
                  ? 'var(--primary)'
                  : 'var(--text-bright)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.01em',
            }}
          >
            {passedCount} of {scenarios.length}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            scenarios passed
            {passedCount >= 4 ? ' — activation unlocked' : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={runAll}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Sparkles size={14} /> Run all scenarios
        </button>
      </div>

      {/* Scenarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {scenarios.map((name) => {
          const detail = buildScenarioDetail(agent, name);
          const hasRun = !!runs[name]?.output;
          const isOpen = expanded === name;
          const result = runs[name]?.result;
          const status = passed[name] === true ? 'passed' : result === 'fail' ? 'failed' : hasRun ? 'ran' : 'idle';
          const statusColor =
            status === 'passed'
              ? 'var(--primary)'
              : status === 'failed'
              ? 'var(--negative)'
              : status === 'ran'
              ? '#f59e0b'
              : 'var(--text-muted)';
          return (
            <div
              key={name}
              className="dark-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                borderColor: isOpen
                  ? 'color-mix(in srgb, var(--primary) 30%, var(--border))'
                  : 'var(--border)',
              }}
            >
              <div
                style={{
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: statusColor,
                    }}
                  />
                  <span
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: statusColor,
                    }}
                  >
                    {status}
                  </span>
                </div>
                <div style={{ display: 'inline-flex', gap: 6 }}>
                  {hasRun ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : name)}
                      style={{
                        padding: '6px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: 'var(--text-body)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {isOpen ? 'Hide' : 'Show'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => runScenario(name)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: 'var(--primary)',
                      background:
                        'color-mix(in srgb, var(--primary) 10%, transparent)',
                      border:
                        '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Play size={10} /> Run test
                  </button>
                </div>
              </div>
              {isOpen && hasRun ? (
                <div
                  style={{
                    padding: 14,
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Lead context
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-body)' }}>
                      {detail.lead_name} · {detail.source} — "{detail.message}"
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Agent draft
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text-body)',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: 10,
                        lineHeight: 1.55,
                      }}
                    >
                      {runs[name].output.draft}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      Tools it would call
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {runs[name].output.tools.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-body)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      paddingTop: 4,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => markScenario(name, 'pass')}
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--primary)',
                        background:
                          'color-mix(in srgb, var(--primary) 12%, transparent)',
                        border:
                          '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => markScenario(name, 'edit')}
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-body)',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => markScenario(name, 'fail')}
                      style={{
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--negative)',
                        background:
                          'color-mix(in srgb, var(--negative) 10%, transparent)',
                        border:
                          '1px solid color-mix(in srgb, var(--negative) 30%, transparent)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <X size={12} /> Fail
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
