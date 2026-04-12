'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';
import { Button } from '@/components/ui/Button';
import { devBypass, DEV_BYPASS_ENABLED } from '@/lib/admin';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { DashboardMockup } from '@/components/landing/DashboardMockup';
import { LogoWall } from '@/components/landing/LogoWall';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { Pricing } from '@/components/landing/Pricing';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

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
    router.push(`/checkout?plan=${plan || 'inbound'}`);
  }

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        window.location.href = '/admin';
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <HeroHeader onGetStarted={() => handleGetStarted('inbound')} />

      <main className="overflow-hidden mesh-bg" style={{ minHeight: '100vh', color: 'var(--text-bright)' }}>
        {/* Ambient glow lights */}
        <div aria-hidden className="absolute inset-0 pointer-events-none isolate opacity-60 hidden lg:block" style={{ zIndex: 2 }}>
          <div
            className="absolute left-0 top-0 -rotate-45 rounded-full"
            style={{
              width: '35rem',
              height: '80rem',
              transform: 'translateY(-350px) rotate(-45deg)',
              background: 'radial-gradient(68% 68% at 55% 31%, rgba(52,211,153,0.12) 0, rgba(31,111,74,0.04) 50%, transparent 80%)',
            }}
          />
          <div
            className="absolute right-0 top-0 rotate-12 rounded-full"
            style={{
              width: '40rem',
              height: '80rem',
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(52,211,153,0.08) 0, transparent 80%)',
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
                  <a
                    href="#features"
                    className="hover:bg-white/5 group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 transition-all duration-300"
                    style={{ borderColor: 'var(--dark-border)', background: 'rgba(52,211,153,0.05)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text-bright)' }}>
                      <span style={{ color: 'var(--emerald-bright)' }}>{'\u25CF'}</span> Live AI receptionist &middot; always answering
                    </span>
                    <span className="block h-4 w-0.5" style={{ background: 'var(--dark-border)' }} />
                    <div
                      className="size-6 overflow-hidden rounded-full duration-500"
                      style={{ background: 'var(--emerald-bright)' }}
                    >
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" style={{ color: '#06140e' }} />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" style={{ color: '#06140e' }} />
                        </span>
                      </div>
                    </div>
                  </a>

                  {/* Headline */}
                  <h1
                    className="mt-8 max-w-5xl mx-auto text-balance font-bold tracking-tight text-5xl md:text-6xl lg:mt-16 xl:text-7xl"
                    style={{ color: 'var(--text-bright)', lineHeight: 1.02, letterSpacing: '-0.04em' }}
                  >
                    The AI receptionist your business{' '}
                    <span style={{ color: 'var(--emerald-bright)' }}>never knew it could afford.</span>
                  </h1>

                  {/* Subhead */}
                  <p className="mx-auto mt-8 max-w-2xl text-balance text-lg" style={{ color: 'var(--text-muted)' }}>
                    Chatty answers every call, qualifies every lead, and books every appointment &mdash; for less than a single missed sale per month.
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
                    style={{ borderColor: 'var(--dark-border)', background: 'rgba(52,211,153,0.1)' }}
                  >
                    <Button size="lg" className="rounded-xl px-5 text-base" onClick={() => handleGetStarted('inbound')}>
                      Start for $97/mo
                    </Button>
                  </div>
                  <Button size="lg" variant="ghost" className="rounded-xl px-5">
                    See it in action
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

        <LogoWall />
        <FeatureGrid />
        <Pricing onGetStarted={handleGetStarted} />
        <FinalCTA onGetStarted={() => handleGetStarted('inbound')} />
        <Footer />
      </main>
    </>
  );
}
