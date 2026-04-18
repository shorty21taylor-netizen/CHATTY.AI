'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { devBypass, DEV_BYPASS_ENABLED } from '@/lib/admin';
import { forceDarkForPage, restoreSavedTheme } from '@/lib/theme';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/landing/Footer';

export default function PricingPage() {
  const router = useRouter();

  function handleGetStarted(plan) {
    if (DEV_BYPASS_ENABLED) {
      devBypass();
      router.push('/dashboard');
      return;
    }
    router.push(`/checkout?plan=${plan || 'convert'}`);
  }

  useEffect(() => {
    forceDarkForPage();
    return () => restoreSavedTheme();
  }, []);

  return (
    <div style={{ background: 'var(--app-bg)', minHeight: '100vh' }}>
      <HeroHeader onGetStarted={() => handleGetStarted('pro')} />
      <main className="pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center mb-8">
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            Pricing
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight"
            style={{
              color: 'var(--text-bright)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Flat-rate. No per-minute games.
          </h1>
          <p
            className="mt-4 text-lg mx-auto max-w-2xl"
            style={{ color: 'var(--text-muted)' }}
          >
            Built for roofing, HVAC, solar, exteriors, and remodeling.
            Cancel anytime.{' '}
            <Link
              href="/"
              style={{
                color: 'var(--emerald-bright)',
                textDecoration: 'underline',
              }}
            >
              Back to home →
            </Link>
          </p>
        </div>
        <Pricing onGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
