'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  isAdmin,
  setAdminSession,
  ADMIN_BYPASS_PASSWORD,
} from '@/lib/admin';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (!isAdmin(email)) {
      setError('Not authorized');
      return;
    }
    if (password !== ADMIN_BYPASS_PASSWORD) {
      setError('Wrong password');
      return;
    }
    setAdminSession(email);
    router.push('/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 24,
      }}
    >
      <div
        className="mac-card"
        style={{ width: 420, overflow: 'hidden' }}
      >
        <div className="mac-traffic">
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink-soft)',
              marginRight: 48,
            }}
          >
            chatty.ai — admin
          </div>
        </div>

        <div style={{ padding: 36 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--gold-soft)',
              color: 'var(--green-deep)',
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            RESTRICTED
          </div>
          <h1
            className="font-serif"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 30,
              color: 'var(--green)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              fontWeight: 600,
            }}
          >
            Admin Access
          </h1>
          <p
            style={{
              color: 'var(--ink-soft)',
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            Bypass landing &amp; checkout · go straight to dashboard
          </p>

          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div>
              <label className="label-mac">Admin Email</label>
              <input
                type="email"
                className="input-mac"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="label-mac">Admin Password</label>
              <input
                type="password"
                className="input-mac"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div
                style={{
                  color: '#c0392b',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'rgba(192,57,43,0.08)',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(192,57,43,0.2)',
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="mac-btn"
              style={{ width: '100%', marginTop: 6, fontSize: 15 }}
            >
              Enter Dashboard →
            </button>
          </form>

          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              fontSize: 12,
              color: 'var(--ink-soft)',
              textAlign: 'center',
            }}
          >
            Authorized personnel only · Chatty.AI
          </div>
        </div>
      </div>
    </div>
  );
}
