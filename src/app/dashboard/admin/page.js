'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Bot,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Mail,
  Bug,
} from 'lucide-react';

const TABS = [
  { key: 'organization', label: 'Organization', icon: Building2 },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'agents', label: 'Agents Config', icon: Bot },
  { key: 'api', label: 'API Keys', icon: KeyRound },
  { key: 'security', label: 'Security', icon: ShieldCheck },
  { key: 'errors', label: 'Errors', icon: Bug },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const VERTICALS = [
  { key: 'roofing', label: 'Roofing' },
  { key: 'hvac', label: 'HVAC' },
  { key: 'solar', label: 'Solar' },
  { key: 'siding', label: 'Siding' },
  { key: 'windows', label: 'Windows' },
  { key: 'remodeling', label: 'Remodeling' },
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
];

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Anthony Taylor',
    email: 'anthony@chatty.ai',
    role: 'Owner',
    roleColor: 'var(--primary)',
    lastActive: 'Now',
    color: '#ef4444',
  },
  {
    id: 2,
    name: 'Jordan Blake',
    email: 'jordan@chatty.ai',
    role: 'Admin',
    roleColor: '#3b82f6',
    lastActive: '2h ago',
    color: '#f59e0b',
  },
  {
    id: 3,
    name: 'Morgan Reyes',
    email: 'morgan@chatty.ai',
    role: 'Operator',
    roleColor: '#8b5cf6',
    lastActive: 'Yesterday',
    color: '#0F8A4F',
  },
];

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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

function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function OrganizationTab() {
  const [selected, setSelected] = useState(new Set(['roofing', 'hvac']));

  const toggle = (k) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Org + logo */}
      <div className="dark-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Organization details
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
          Basic info that appears in briefs and outbound messages.
        </div>
        <div
          className="admin-org-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 180px',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FieldLabel>Organization name</FieldLabel>
              <input defaultValue="Taylor Roofing & HVAC" style={{ width: '100%' }} />
            </div>
            <div>
              <FieldLabel>Public contact email</FieldLabel>
              <input defaultValue="hello@taylorroofing.com" style={{ width: '100%' }} />
            </div>
            <div>
              <FieldLabel>Business phone</FieldLabel>
              <input defaultValue="(555) 123-4500" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <FieldLabel>Logo</FieldLabel>
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                border: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                color: 'var(--text-muted)',
                fontSize: 11,
                textAlign: 'center',
                padding: 12,
                background: 'color-mix(in srgb, var(--text-muted) 6%, transparent)',
              }}
            >
              <Upload size={20} />
              Drop a PNG/SVG
              <button
                type="button"
                className="filter-pill"
                style={{ marginTop: 4 }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical pills */}
      <div className="dark-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-bright)',
            marginBottom: 4,
          }}
        >
          Your verticals
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          The Decision Engine tunes recommendations per vertical.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VERTICALS.map((v) => {
            const active = selected.has(v.key);
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => toggle(v.key)}
                className={active ? 'filter-pill-active' : 'filter-pill'}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hours + tz + SMS */}
      <div
        className="admin-bottom-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        <div className="dark-card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 4,
            }}
          >
            Business hours
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Voice agents auto-answer during these hours.
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            <div>
              <FieldLabel>Open</FieldLabel>
              <input defaultValue="7:00 AM" style={{ width: '100%' }} />
            </div>
            <div>
              <FieldLabel>Close</FieldLabel>
              <input defaultValue="8:00 PM" style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <FieldLabel>Timezone</FieldLabel>
            <select defaultValue="cst" style={{ width: '100%' }}>
              <option value="est">Eastern (ET)</option>
              <option value="cst">Central (CT)</option>
              <option value="mst">Mountain (MT)</option>
              <option value="pst">Pacific (PT)</option>
            </select>
          </div>
        </div>

        <div className="dark-card" style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 4,
            }}
          >
            SMS sender ID
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
            Your Twilio sub-account number used for outbound SMS.
          </div>
          <FieldLabel>Sender phone</FieldLabel>
          <input defaultValue="+1 (555) 123-4500" style={{ width: '100%' }} />
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Pill color="var(--primary)">VERIFIED</Pill>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              A2P 10DLC brand approved
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" className="filter-pill">
          Cancel
        </button>
        <button type="button" className="btn-primary">
          Save changes
        </button>
      </div>
    </div>
  );
}

function TeamTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
              }}
            >
              Team members
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              3 of 5 seats used on Growth plan.
            </div>
          </div>
          <button type="button" className="btn-primary">
            <Mail size={14} />
            Invite member
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: m.color,
                          color: '#ffffff',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {initials(m.name)}
                      </div>
                      <span
                        style={{
                          color: 'var(--text-bright)',
                          fontWeight: 500,
                        }}
                      >
                        {m.name}
                      </span>
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>
                    <Pill color={m.roleColor}>{m.role.toUpperCase()}</Pill>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.lastActive}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="filter-pill">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title, hint }) {
  return (
    <div
      className="dark-card"
      style={{
        padding: 40,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-bright)',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {hint}
    </div>
  );
}

function ErrorsTab() {
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/errors?limit=50&days=7');
        if (res.ok) {
          const data = await res.json();
          setErrors(data.errors || []);
          setStats(data.stats || []);
        }
      } catch (err) {
        console.error('Failed to load errors:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="dark-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading error log...
      </div>
    );
  }

  const totalErrors = stats.reduce((sum, s) => sum + (s.count || 0), 0);
  const maxCount = Math.max(...stats.map((s) => s.count || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats bar chart */}
      <div className="dark-card" style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4 }}>
          Error Trend (7 days)
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          {totalErrors} total errors this week
        </div>
        {stats.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {stats.map((s) => (
              <div key={s.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: '100%',
                    height: Math.max(4, (s.count / maxCount) * 64),
                    background: s.count > 0 ? '#ef4444' : 'var(--dark-surface-2)',
                    borderRadius: 4,
                    opacity: s.count > 0 ? 0.8 : 0.3,
                  }}
                />
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                  {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>
            No errors recorded
          </div>
        )}
      </div>

      {/* Error list */}
      <div className="dark-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
            Recent Errors
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Last 50 errors from your org
          </div>
        </div>
        {errors.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No errors found. Your system is running clean.
          </div>
        ) : (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {errors.map((err) => (
              <div
                key={err.id}
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Pill color={err.level === 'error' ? '#ef4444' : err.level === 'warn' ? '#f59e0b' : '#3b82f6'}>
                    {(err.level || 'error').toUpperCase()}
                  </Pill>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {err.source}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>
                    {new Date(err.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
                  {err.message}
                </div>
                {err.stack && (
                  <pre style={{
                    marginTop: 6,
                    padding: 8,
                    borderRadius: 6,
                    background: 'var(--dark-surface-2)',
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    overflowX: 'auto',
                    maxHeight: 120,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {err.stack}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DangerZoneTab() {
  return (
    <div
      className="dark-card"
      style={{
        padding: 24,
        borderColor: 'color-mix(in srgb, var(--negative) 40%, var(--border))',
        background: 'color-mix(in srgb, var(--negative) 6%, transparent)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--negative)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <AlertTriangle size={14} />
        Danger zone
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginTop: 16,
        }}
      >
        {[
          {
            title: 'Pause all AI agents',
            hint: 'Stops inbound/outbound automation immediately. Briefs continue.',
            cta: 'Pause agents',
          },
          {
            title: 'Export all CRM data',
            hint: 'Downloads a zip of contacts, leads, estimates, jobs, interactions.',
            cta: 'Export CSV',
          },
          {
            title: 'Delete organization',
            hint: 'Permanent. All data is wiped after a 14-day grace period.',
            cta: 'Delete org',
            destructive: true,
          },
        ].map((row) => (
          <div
            key={row.title}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 16,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface-1)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-bright)',
                }}
              >
                {row.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {row.hint}
              </div>
            </div>
            <button
              type="button"
              className="filter-pill"
              style={{
                color: row.destructive ? 'var(--negative)' : undefined,
                borderColor: row.destructive
                  ? 'color-mix(in srgb, var(--negative) 40%, var(--border))'
                  : undefined,
              }}
            >
              {row.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('organization');

  return (
    <div>
      <div>
        <div className="t-eyebrow">Admin</div>
        <h1 className="t-h1" style={{ margin: '8px 0 6px' }}>
          Settings &amp; admin
        </h1>
        <p className="t-body-sm" style={{ margin: 0 }}>
          Manage your org, team, agents, and security.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 0,
        }}
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${
                  active ? 'var(--primary)' : 'transparent'
                }`,
                color: active ? 'var(--text-bright)' : 'var(--text-muted)',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        {tab === 'organization' && <OrganizationTab />}
        {tab === 'team' && <TeamTab />}
        {tab === 'agents' && (
          <PlaceholderTab
            title="Agents config"
            hint="Per-agent prompts, voice selection, and escalation rules. Coming in the next release."
          />
        )}
        {tab === 'api' && (
          <PlaceholderTab
            title="API keys"
            hint="Rotate your Anthropic, ElevenLabs, Twilio, and Voyage keys. Handled by your Railway environment."
          />
        )}
        {tab === 'security' && (
          <PlaceholderTab
            title="Security"
            hint="SSO (SAML/OIDC), audit logs, and webhook HMAC secrets. Available on the Enterprise plan."
          />
        )}
        {tab === 'errors' && <ErrorsTab />}
        {tab === 'danger' && <DangerZoneTab />}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.admin-org-grid),
          :global(.admin-bottom-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
