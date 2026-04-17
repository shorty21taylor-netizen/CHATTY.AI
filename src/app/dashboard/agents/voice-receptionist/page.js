'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, Clock, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

const OUTCOME_COLORS = {
  qualified: '#22c55e',
  appointment_booked: '#10b981',
  unqualified: '#f59e0b',
  voicemail: '#6b7280',
  no_answer: '#6b7280',
  abandoned: '#ef4444',
};

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function VoiceReceptionistPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [enabled, setEnabled] = useState(true);

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch('/api/voice/calls');
      if (res.ok) {
        const { calls: data } = await res.json();
        setCalls(data || []);
      }
    } catch (err) {
      console.error('Failed to load calls:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const completedCalls = calls.filter((c) => c.status === 'completed');
  const qualifiedCalls = completedCalls.filter(
    (c) => c.outcome === 'qualified' || c.outcome === 'appointment_booked'
  );
  const avgDuration = completedCalls.length
    ? Math.round(completedCalls.reduce((s, c) => s + (c.durationSeconds || 0), 0) / completedCalls.length)
    : 0;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
            Voice Receptionist
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            ElevenLabs Conversational AI — qualifies inbound calls and books appointments.
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-2)',
            color: enabled ? '#fff' : 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Calls', value: calls.length, icon: Phone },
          { label: 'Completed', value: completedCalls.length, icon: CheckCircle },
          { label: 'Qualified', value: qualifiedCalls.length, icon: AlertCircle },
          { label: 'Avg Duration', value: formatDuration(avgDuration), icon: Clock },
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

      {/* Call history */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dark-border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
            Recent Calls
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
            Last 50
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : calls.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No calls yet. Configure your Twilio number to forward to the voice webhook.
          </div>
        ) : (
          <div>
            {calls.map((call) => {
              const isExpanded = expanded === call.id;
              const outcomeColor = OUTCOME_COLORS[call.outcome] || '#6b7280';
              return (
                <div key={call.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : call.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '12px 20px',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid var(--dark-border)',
                      cursor: 'pointer',
                      gap: 12,
                      textAlign: 'left',
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    ) : (
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13, color: 'var(--text-bright)', flex: 1, fontFamily: 'monospace' }}>
                      {call.callerNumber}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60, textAlign: 'right' }}>
                      {formatDuration(call.durationSeconds)}
                    </span>
                    {call.outcome && (
                      <Pill color={outcomeColor}>
                        {call.outcome.replace(/_/g, ' ').toUpperCase()}
                      </Pill>
                    )}
                    <Pill color={call.status === 'completed' ? '#22c55e' : call.status === 'failed' ? '#ef4444' : '#6b7280'}>
                      {call.status.toUpperCase()}
                    </Pill>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 120, textAlign: 'right' }}>
                      {formatTime(call.startedAt)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '12px 20px 16px 46px', borderBottom: '1px solid var(--dark-border)', background: 'rgba(16,185,129,0.02)' }}>
                      {call.transcript && Array.isArray(call.transcript) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {call.transcript.map((turn, i) => (
                            <div key={i}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: turn.role === 'agent' ? 'var(--emerald-bright)' : 'var(--text-muted)', textTransform: 'uppercase', marginRight: 8 }}>
                                {turn.role}
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--text-bright)' }}>
                                {turn.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No transcript available for this call.
                        </p>
                      )}
                      {call.outcomeData && (
                        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--dark-surface-2)', fontSize: 12, color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--text-bright)' }}>Outcome Data:</strong>{' '}
                          {JSON.stringify(call.outcomeData)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
