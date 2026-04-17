'use client';

import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Clock, Play, X, RefreshCw } from 'lucide-react';

function Pill({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        borderRadius: 999,
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  running: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
};

function scoreColor(score) {
  if (score === null || score === undefined) return '#6b7280';
  if (score >= 0.8) return '#22c55e';
  if (score >= 0.5) return '#f59e0b';
  return '#ef4444';
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const AGENT_TYPES = [
  'instant_lead_response',
  'cadence',
  'reclaim_aged',
  'reclaim_abandoned',
  'reclaim_reactivation',
  'review_request',
  'form_bot',
  'social_dm',
  'voice',
  'telegram_ea',
];

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    agent_type: 'instant_lead_response',
    scenario_name: '',
    input_signal: '{\n  "contact_name": "John Smith",\n  "source": "website_form",\n  "service_type": "roofing"\n}',
    actual_output: '',
  });
  const [formError, setFormError] = useState('');

  const fetchSimulations = useCallback(async () => {
    try {
      const res = await fetch('/api/simulations/list');
      if (res.ok) {
        const data = await res.json();
        setSimulations(data.simulations || []);
      }
    } catch (err) {
      console.error('Failed to load simulations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  async function handleSubmit() {
    setFormError('');
    let inputSignal;
    try {
      inputSignal = JSON.parse(form.input_signal);
    } catch {
      setFormError('input_signal must be valid JSON');
      return;
    }

    let actualOutput = undefined;
    if (form.actual_output.trim()) {
      try {
        actualOutput = JSON.parse(form.actual_output);
      } catch {
        setFormError('actual_output must be valid JSON (or leave empty)');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/simulations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_type: form.agent_type,
          scenario_name: form.scenario_name || undefined,
          input_signal: inputSignal,
          actual_output: actualOutput,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to trigger simulation');
      }
      setShowModal(false);
      setLoading(true);
      fetchSimulations();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const completed = simulations.filter((s) => s.status === 'completed').length;
  const failed = simulations.filter((s) => s.status === 'failed').length;
  const avgScore = (() => {
    const scored = simulations.filter((s) => s.comparisonScore !== null && s.comparisonScore !== undefined);
    if (!scored.length) return null;
    return (scored.reduce((sum, s) => sum + Number(s.comparisonScore), 0) / scored.length).toFixed(2);
  })();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
            Agent Simulations
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Dry-run agents against canned or custom signals — regression harness for the Decision Engine.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--emerald-bright)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Play size={14} />
          Run Simulation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Runs', value: simulations.length, icon: FlaskConical },
          { label: 'Completed', value: completed, icon: Play },
          { label: 'Failed', value: failed, icon: X },
          { label: 'Avg Score', value: avgScore !== null ? avgScore : '—', icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="dark-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <stat.icon size={14} style={{ color: 'var(--emerald-bright)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Simulation History */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Recent Simulations
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
              Last 50
            </span>
          </div>
          <button
            onClick={() => { setLoading(true); fetchSimulations(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--dark-border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : simulations.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No simulations yet. Click "Run Simulation" to test an agent.
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 80px 80px 80px 120px',
              padding: '8px 20px',
              borderBottom: '1px solid var(--dark-border)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
            }}>
              <span>Agent Type</span>
              <span>Scenario</span>
              <span>Status</span>
              <span>Score</span>
              <span>Duration</span>
              <span style={{ textAlign: 'right' }}>Created</span>
            </div>
            {simulations.map((sim) => (
              <div key={sim.id} style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 80px 80px 80px 120px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--dark-border)',
                alignItems: 'center',
                fontSize: 13,
              }}>
                <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
                  {sim.agentType.replace(/_/g, ' ')}
                </span>
                <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sim.scenarioName || '—'}
                </span>
                <Pill color={STATUS_COLORS[sim.status] || '#6b7280'}>
                  {sim.status.toUpperCase()}
                </Pill>
                <span style={{
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: scoreColor(sim.comparisonScore),
                }}>
                  {sim.comparisonScore !== null && sim.comparisonScore !== undefined
                    ? Number(sim.comparisonScore).toFixed(2)
                    : '—'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {sim.durationMs !== null ? `${sim.durationMs}ms` : '—'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'right' }}>
                  {formatTime(sim.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dark-card"
            style={{
              width: 520,
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-bright)' }}>
                Run Simulation
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Agent Type
                </label>
                <select
                  value={form.agent_type}
                  onChange={(e) => setForm({ ...form, agent_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--dark-border)',
                    background: 'var(--dark-surface-2)',
                    color: 'var(--text-bright)',
                    fontSize: 13,
                  }}
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Scenario Name (optional)
                </label>
                <input
                  type="text"
                  value={form.scenario_name}
                  onChange={(e) => setForm({ ...form, scenario_name: e.target.value })}
                  placeholder="e.g., hot roofing lead via form"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--dark-border)',
                    background: 'var(--dark-surface-2)',
                    color: 'var(--text-bright)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Input Signal (JSON)
                </label>
                <textarea
                  value={form.input_signal}
                  onChange={(e) => setForm({ ...form, input_signal: e.target.value })}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--dark-border)',
                    background: 'var(--dark-surface-2)',
                    color: 'var(--text-bright)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Expected Output (JSON, optional — enables scoring)
                </label>
                <textarea
                  value={form.actual_output}
                  onChange={(e) => setForm({ ...form, actual_output: e.target.value })}
                  rows={4}
                  placeholder='{"reply_preview": "...", "actions_planned": [...], "confidence": 0.9}'
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--dark-border)',
                    background: 'var(--dark-surface-2)',
                    color: 'var(--text-bright)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    resize: 'vertical',
                  }}
                />
              </div>

              {formError && (
                <p style={{ fontSize: 12, color: '#ef4444' }}>{formError}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--emerald-bright)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Submitting...' : 'Run Simulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
