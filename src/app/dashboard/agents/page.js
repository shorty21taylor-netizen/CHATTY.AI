'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Zap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Repeat,
  RotateCw,
  Users,
  Mic,
} from 'lucide-react';
import { PILLARS, AGENTS, STATUS_META } from '@/lib/agents';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const ICONS = {
  Phone,
  Zap,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  Repeat,
  RotateCw,
  Users,
};

export default function AgentsPage() {
  // Local enable state keyed by agent id (seeded from catalog status).
  const initial = Object.fromEntries(AGENTS.map((a) => [a.id, a.status === 'active']));
  const [enabled, setEnabled] = useState(initial);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="t-eyebrow">Agents</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Your AI sales team
        </h1>
        <p className="t-body" style={{ color: 'var(--text-muted)', margin: 0 }}>
          10 agents, one funnel. Toggle on what you need.
        </p>
      </div>

      {PILLARS.map((p) => (
        <section key={p.tag} style={{ marginBottom: 38 }}>
          {/* Pillar heading row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.3)',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'var(--emerald-bright)',
              }}
            >
              {p.tag}
            </span>
            <div className="t-body-sm">{p.description}</div>
          </div>

          <AnimatedGroup
            preset="blur-slide"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            {AGENTS.filter((a) => a.pillar === p.tag).map((a) => {
              const Icon = ICONS[a.icon] || Phone;
              const status = a.status;
              const meta = STATUS_META[status];
              const on = enabled[a.id];
              return (
                <div
                  key={a.id}
                  className={`dark-card ${a.featured ? 'glow-border' : ''}`}
                  style={{ padding: 20, display: 'flex', flexDirection: 'column' }}
                >
                  {/* Top: icon + name */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: 'var(--emerald-bright)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="t-h3">{a.name}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="t-body-sm" style={{ margin: 0, marginBottom: 14, minHeight: 38 }}>
                    {a.description}
                  </p>

                  {/* Voice note badge */}
                  {a.voiceNotes ? (
                    <div style={{ marginBottom: 12 }}>
                      <VoiceNoteBadge />
                    </div>
                  ) : null}

                  {/* Status row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      paddingTop: 12,
                      borderTop: '1px solid var(--dark-border)',
                    }}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      onClick={() => setEnabled((e) => ({ ...e, [a.id]: !e[a.id] }))}
                      style={{
                        width: 38,
                        height: 22,
                        borderRadius: 999,
                        background: on ? 'var(--emerald-bright)' : 'var(--dark-surface-3)',
                        border: '1px solid ' + (on ? 'var(--emerald-bright)' : 'var(--dark-border)'),
                        position: 'relative',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background .15s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: on ? 18 : 2,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: on ? '#06140e' : '#8a9290',
                          transition: 'left .15s',
                        }}
                      />
                    </button>

                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        background: meta.bg,
                        color: meta.color,
                        border: '1px solid ' + meta.border,
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Configure link */}
                  <Link
                    href={`/dashboard/agents/${a.id}`}
                    style={{
                      marginTop: 12,
                      color: 'var(--emerald-bright)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Configure {'\u2192'}
                  </Link>
                </div>
              );
            })}
          </AnimatedGroup>
        </section>
      ))}
    </div>
  );
}

export function VoiceNoteBadge() {
  return (
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
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      <Mic size={10} />
      Voice Notes Enabled
    </span>
  );
}
