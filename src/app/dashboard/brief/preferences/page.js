'use client';

import { useState, useEffect } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

function timeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const label = new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      opts.push({ val, label });
    }
  }
  return opts;
}

const TIMES = timeOptions();

export default function BriefPreferencesPage() {
  const [prefs, setPrefs] = useState({
    enabled: true,
    delivery_time: '06:00',
    timezone: 'America/New_York',
    sms_enabled: true,
    voice_enabled: false, // force off — audio blob storage not wired yet (see PR AL)
    email_enabled: false,
    phone_number: '',
    email_address: '',
    voice_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/brief/preferences');
        if (res.ok) {
          const { preferences: p } = await res.json();
          setPrefs({
            enabled: p.enabled ?? true,
            delivery_time: p.deliveryTime || p.delivery_time || '06:00',
            timezone: p.timezone || 'America/New_York',
            sms_enabled: p.smsEnabled ?? p.sms_enabled ?? true,
            // Force voice_enabled off regardless of DB state. Until audio
            // blob storage ships, we don't honor it server-side anyway.
            voice_enabled: false,
            email_enabled: p.emailEnabled ?? p.email_enabled ?? false,
            phone_number: p.phoneNumber || p.phone_number || '',
            email_address: p.emailAddress || p.email_address || '',
            voice_id: p.voiceId || p.voice_id || '',
          });
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
    // NOTE: previously also fetched /api/voice/voices for the voice
    // picker. Dropped along with the Voice Summary toggle — will come
    // back when audio blob storage ships.
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/brief/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Force voice_enabled off at the wire until audio storage is wired.
        // Same rationale as the disabled toggle UI above — the backend
        // drops the audio anyway, persisting `true` just creates drift.
        body: JSON.stringify({ ...prefs, voice_enabled: false }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Save failed');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--dark-border)',
    background: 'var(--dark-surface-2)',
    color: 'var(--text-bright)',
    fontSize: 13,
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading preferences...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/dashboard/brief"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={14} />
          Back to Mission Control
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={20} style={{ color: 'var(--emerald-bright)' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>
            Brief Preferences
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Configure when and how your Daily Brief is delivered.
        </p>
      </div>

      <div className="dark-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Daily Brief Enabled
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Turn on to receive automated daily briefs.
            </div>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, enabled: !prefs.enabled })}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: 'none',
              background: prefs.enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: prefs.enabled ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left .15s',
              }}
            />
          </button>
        </div>

        {/* Delivery time */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Delivery Time
          </label>
          <select
            value={prefs.delivery_time}
            onChange={(e) => setPrefs({ ...prefs, delivery_time: e.target.value })}
            style={inputStyle}
          >
            {TIMES.map((t) => (
              <option key={t.val} value={t.val}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Timezone
          </label>
          <select
            value={prefs.timezone}
            onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
            style={inputStyle}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Phone number */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Phone Number (E.164 format)
          </label>
          <input
            type="tel"
            value={prefs.phone_number}
            onChange={(e) => setPrefs({ ...prefs, phone_number: e.target.value })}
            placeholder="+15551234567"
            style={inputStyle}
          />
        </div>

        {/* SMS toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              SMS Delivery
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Receive your brief via text message.
            </div>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, sms_enabled: !prefs.sms_enabled })}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: 'none',
              background: prefs.sms_enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: prefs.sms_enabled ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left .15s',
              }}
            />
          </button>
        </div>

        {/* Voice summary — disabled until audio blob storage is wired.
            Displaying a working toggle here when the backend silently
            drops the audio (see brief-deliver.ts: sent:false,
            reason:audio_storage_not_configured) trains operators to
            distrust every other setting on this page. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: 0.6,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-bright)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Voice Summary
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  background:
                    'color-mix(in srgb, var(--text-muted) 18%, transparent)',
                  color: 'var(--text-muted)',
                  border:
                    '1px solid color-mix(in srgb, var(--text-muted) 30%, transparent)',
                }}
              >
                COMING SOON
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ElevenLabs audio playback will return once signed-URL audio
              storage is live.
            </div>
          </div>
          <div
            aria-disabled="true"
            title="Voice brief delivery is temporarily disabled"
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: '1px solid var(--dark-border)',
              background: 'var(--dark-surface-2)',
              position: 'relative',
              cursor: 'not-allowed',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'color-mix(in srgb, #fff 50%, transparent)',
              }}
            />
          </div>
        </div>

        {/* Email toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Email Delivery
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Receive a formatted HTML email of your brief.
            </div>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, email_enabled: !prefs.email_enabled })}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: 'none',
              background: prefs.email_enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: prefs.email_enabled ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left .15s',
              }}
            />
          </button>
        </div>

        {/* Email address */}
        {prefs.email_enabled && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={prefs.email_address}
              onChange={(e) => setPrefs({ ...prefs, email_address: e.target.value })}
              placeholder="operator@company.com"
              style={inputStyle}
            />
          </div>
        )}

        {/* Voice selection intentionally removed — see Voice Summary note
            above. Will return once signed-URL audio storage ships. */}

        {error && (
          <p style={{ fontSize: 12, color: '#ef4444' }}>{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: saved ? '#22c55e' : 'var(--emerald-bright)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
