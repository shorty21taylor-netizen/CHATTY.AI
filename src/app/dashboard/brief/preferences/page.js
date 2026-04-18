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
    voice_enabled: true,
    email_enabled: false,
    phone_number: '',
    email_address: '',
    voice_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voices, setVoices] = useState([]);
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
            voice_enabled: p.voiceEnabled ?? p.voice_enabled ?? true,
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

    async function loadVoices() {
      try {
        const res = await fetch('/api/voice/voices');
        if (res.ok) {
          const data = await res.json();
          setVoices(data.voices || []);
        }
      } catch {}
    }

    load();
    loadVoices();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/brief/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
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

        {/* Voice toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
              Voice Summary
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Generate an audio version of your brief via ElevenLabs.
            </div>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, voice_enabled: !prefs.voice_enabled })}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: 'none',
              background: prefs.voice_enabled ? 'var(--emerald-bright)' : 'var(--dark-surface-2)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: prefs.voice_enabled ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left .15s',
              }}
            />
          </button>
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

        {/* Voice selection */}
        {prefs.voice_enabled && voices.length > 0 && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Voice
            </label>
            <select
              value={prefs.voice_id}
              onChange={(e) => setPrefs({ ...prefs, voice_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Default</option>
              {voices.map((v) => (
                <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

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
