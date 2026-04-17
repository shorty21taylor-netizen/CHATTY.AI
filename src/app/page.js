'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Button } from '@/components/ui/Button';
import { devBypass, DEV_BYPASS_ENABLED } from '@/lib/admin';
import { forceDarkForPage, restoreSavedTheme } from '@/lib/theme';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { Pillars } from '@/components/landing/Pillars';
import { TradesStrip } from '@/components/landing/TradesStrip';
import { CapabilityCards } from '@/components/landing/CapabilityCards';
import { InlineFeatures } from '@/components/landing/InlineFeatures';
import { CenterpieceCard } from '@/components/landing/CenterpieceCard';
import { PhoneMockup } from '@/components/landing/PhoneMockup';
import { TrustSection } from '@/components/landing/TrustSection';
import { Pricing } from '@/components/landing/Pricing';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { ResultsStrip } from '@/components/landing/ResultsStrip';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: '0%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--emerald-bright)',
        zIndex: 100,
      }}
    />
  );
}

const transitionVariants = {
  container: {
    visible: { transition: { staggerChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
    },
  },
};

export default function Landing() {
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
    // Landing page is always dark — force it, restore saved theme on unmount.
    forceDarkForPage();

    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        window.location.href = '/admin';
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      restoreSavedTheme();
    };
  }, []);

  return (
    <>
      <ScrollProgress />
      <HeroHeader onGetStarted={() => handleGetStarted('inbound')} />

      <main className="landing-scope overflow-hidden mesh-bg" style={{ minHeight: '100vh', color: 'var(--text-bright)' }}>
        {/* Ambient glow lights */}
        <div aria-hidden className="absolute inset-0 pointer-events-none isolate opacity-60 hidden lg:block" style={{ zIndex: 2 }}>
          <div
            className="absolute left-0 top-0 -rotate-45 rounded-full"
            style={{
              width: '35rem',
              height: '80rem',
              transform: 'translateY(-350px) rotate(-45deg)',
              background: 'radial-gradient(68% 68% at 55% 31%, rgba(16,185,129,0.12) 0, rgba(31,111,74,0.04) 50%, transparent 80%)',
            }}
          />
          <div
            className="absolute right-0 top-0 rotate-12 rounded-full"
            style={{
              width: '40rem',
              height: '80rem',
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(16,185,129,0.08) 0, transparent 80%)',
            }}
          />
        </div>

        {/* Hero section */}
        <section className="relative">
          <div className="pt-28 md:pt-40">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ zIndex: -1, background: 'radial-gradient(125% 125% at 50% 100%, transparent 0%, var(--dark-bg) 75%)' }}
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  {/* Eyebrow pill */}
                  <div
                    className="mx-auto flex w-fit items-center gap-2 rounded-full border px-4 py-1.5"
                    style={{ borderColor: 'var(--dark-border)', background: 'rgba(16,185,129,0.05)' }}
                  >
                    <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--emerald-bright)' }}>
                      For roofing, HVAC, solar, exteriors, remodeling
                    </span>
                  </div>

                  {/* Headline */}
                  <h1
                    className="mt-8 max-w-5xl mx-auto text-balance font-bold text-5xl md:text-6xl lg:mt-16 xl:text-7xl"
                    style={{ color: 'var(--text-bright)', lineHeight: 1.02, letterSpacing: '-0.05em' }}
                  >
                    Close more bids.{' '}
                    <span style={{ color: 'var(--emerald-bright)' }}>Chase fewer leads.</span>
                  </h1>

                  {/* Subhead */}
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg" style={{ color: 'var(--text-muted)' }}>
                    Contractors using Chatty AI book 3&ndash;5 more jobs a week on the same lead volume. One daily brief tells you which leads to call, which bids to chase, and what to skip.
                  </p>
                </AnimatedGroup>

                {/* CTA buttons */}
                <AnimatedGroup
                  variants={{
                    container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
                >
                  <div
                    className="rounded-[14px] border p-0.5"
                    style={{ borderColor: 'var(--dark-border)', background: 'rgba(16,185,129,0.1)' }}
                  >
                    <Button size="lg" className="rounded-xl px-6 py-3 text-base font-semibold" onClick={() => handleGetStarted('convert')}>
                      See Your Funnel
                    </Button>
                  </div>
                  <Button size="lg" variant="ghost" className="rounded-xl px-5 text-sm">
                    Book a demo
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            {/* Product mockup */}
            <AnimatedGroup
              variants={{
                container: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } },
                ...transitionVariants,
              }}
            >
              <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ zIndex: 10, background: 'linear-gradient(to bottom, transparent 35%, var(--dark-bg) 100%)' }}
                />
                <div
                  className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 dark-card glow-border"
                  style={{ borderColor: 'var(--dark-border)' }}
                >
                  <DashboardMockup />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <ScrollReveal variant="fadeUp" amount={0.3}>
          <ResultsStrip />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.2}>
          <Pillars />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.3}>
          <TradesStrip />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.2}>
          <CapabilityCards />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.2}>
          <InlineFeatures />
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" amount={0.3}>
          <CenterpieceCard />
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" amount={0.25}>
          <PhoneMockup />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.2}>
          <TrustSection />
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" amount={0.15}>
          <Pricing onGetStarted={handleGetStarted} />
        </ScrollReveal>

        <ScrollReveal variant="scaleIn" amount={0.3}>
          <FinalCTA onGetStarted={() => handleGetStarted('convert')} />
        </ScrollReveal>

        <ScrollReveal variant="fadeIn" amount={0.1}>
          <Footer />
        </ScrollReveal>
      </main>
    </>
  );
}
