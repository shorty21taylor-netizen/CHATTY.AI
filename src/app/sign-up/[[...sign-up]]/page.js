'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';
import { forceDarkForPage, restoreSavedTheme } from '@/lib/theme';

export default function SignUpPage() {
  useEffect(() => {
    forceDarkForPage();
    return () => restoreSavedTheme();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--app-bg)' }}
    >
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5"
        style={{ color: 'var(--text-bright)' }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full inline-block"
          style={{
            background: 'var(--emerald-bright)',
            boxShadow: '0 0 14px var(--emerald-glow)',
          }}
        />
        <span className="font-bold text-lg tracking-tight">Chatty.AI</span>
      </Link>
      <SignUp
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
        appearance={{
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#0a0f0d',
            colorInputBackground: '#121815',
            colorInputText: '#e7f4ed',
            colorText: '#e7f4ed',
            colorTextSecondary: '#8a9590',
            borderRadius: '12px',
          },
        }}
      />
      <p
        className="mt-6 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Already have an account?{' '}
        <Link
          href="/sign-in"
          style={{
            color: 'var(--emerald-bright)',
            textDecoration: 'underline',
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
