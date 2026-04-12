'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function HeroHeader({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'py-2 px-4'
          : 'py-4 px-4'
      )}
    >
      <nav
        className={cn(
          'mx-auto max-w-7xl flex items-center justify-between transition-all duration-300 px-6',
          scrolled
            ? 'rounded-2xl border py-2.5'
            : 'py-2'
        )}
        style={
          scrolled
            ? {
                background: 'rgba(10,15,13,0.7)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderColor: 'var(--dark-border)',
              }
            : {}
        }
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{
              background: 'var(--emerald-bright)',
              boxShadow: '0 0 14px var(--emerald-glow)',
            }}
          />
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: 'var(--text-bright)' }}
          >
            Chatty.AI
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#telegram" className="nav-link">Telegram EA</a>
          <a href="#docs" className="nav-link">Docs</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Sign in</Link>
          </Button>
          <Button size="sm" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: 'var(--text-bright)', background: 'none', border: 'none' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden mx-4 mt-2 rounded-2xl border p-4 flex flex-col gap-3"
          style={{
            background: 'rgba(10,15,13,0.95)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--dark-border)',
          }}
        >
          <a href="#features" className="nav-link py-2">Features</a>
          <a href="#pricing" className="nav-link py-2">Pricing</a>
          <a href="#telegram" className="nav-link py-2">Telegram EA</a>
          <Button size="sm" onClick={onGetStarted} className="w-full mt-2">
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
