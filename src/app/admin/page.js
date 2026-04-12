'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  isAdmin,
  setAdminSession,
  ADMIN_BYPASS_PASSWORD,
  devBypass,
} from '@/lib/admin';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';
import { Button } from '@/components/ui/Button';

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
      setError('Incorrect password');
      return;
    }
    setAdminSession(email);
    router.push('/dashboard');
  }

  function handleQuickBypass() {
    devBypass();
    router.push('/dashboard');
  }

  return (
    <div
      className="app-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <AnimatedGroup preset="blur-slide" style={{ width: 440 }}>
      <div
        className="dark-card"
        style={{ width: '100%', padding: 0, overflow: 'hidden' }}
      >
        {/* macOS chrome */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#ff5f57',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#febc2e',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#28c840',
                display: 'inline-block',
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            chatty.ai — admin
          </div>
        </div>

        <div style={{ padding: 36 }}>
          {/* Restricted pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'var(--emerald-tint)',
              border: '1px solid rgba(16,185,129,0.25)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--emerald-bright)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 20,
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
            Restricted
          </div>

          {/* Brand wordmark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--emerald-bright)',
                boxShadow: '0 0 10px var(--emerald-glow)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                color: 'var(--text-bright)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              Chatty.AI
            </span>
          </div>

          <h1 className="t-h1" style={{ margin: '0 0 8px' }}>
            Admin Access
          </h1>
          <p className="t-body-sm" style={{ margin: '0 0 28px' }}>
            Bypass landing &amp; checkout &mdash; go straight to dashboard
          </p>

          {/* Quick bypass button */}
          <Button
            onClick={handleQuickBypass}
            size="lg"
            className="w-full mb-5 justify-center"
          >
            Skip &amp; Enter Dashboard {'\u2192'}
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '20px 0',
              color: 'var(--text-muted)',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: 'var(--border)' }}
            />
            OR SIGN IN
            <div
              style={{ flex: 1, height: 1, background: 'var(--border)' }}
            />
          </div>

          <form onSubmit={handleLogin}>
            <label
              className="t-eyebrow"
              style={{ display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}
            >
              Admin Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{ width: '100%', marginBottom: 16 }}
            />

            <label
              className="t-eyebrow"
              style={{ display: 'block', marginBottom: 6, letterSpacing: '0.08em' }}
            >
              Admin Password
            </label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ width: '100%', marginBottom: 16 }}
            />

            {error ? (
              <div
                style={{
                  color: '#f87171',
                  fontSize: 13,
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full justify-center"
            >
              Enter Dashboard {'\u2192'}
            </Button>
          </form>

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            Authorized personnel only · Chatty.AI
          </div>
        </div>
      </div>
      </AnimatedGroup>
    </div>
  );
}
