'use client';

import { Building2, Stethoscope, Wrench, Scissors, Hammer, Sparkles } from 'lucide-react';

const LOGOS = [
  { Icon: Building2, name: 'HARBOR' },
  { Icon: Stethoscope, name: 'MERIDIAN' },
  { Icon: Wrench, name: 'OAKLINE' },
  { Icon: Scissors, name: 'NORTH&CO' },
  { Icon: Hammer, name: 'ATLAS' },
  { Icon: Sparkles, name: 'SUMMIT' },
];

export function LogoWall() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          Trusted by 200+ service operators
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {LOGOS.map(({ Icon, name }) => (
            <div
              key={name}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/5"
              style={{ color: 'rgba(245,247,245,0.3)' }}
            >
              <Icon size={18} className="transition-colors duration-300 group-hover:text-[var(--emerald-bright)]" />
              <span
                className="text-xs font-bold tracking-widest transition-colors duration-300 group-hover:text-[var(--text-bright)]"
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
