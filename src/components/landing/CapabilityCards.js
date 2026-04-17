'use client';

import { Home, Wrench, Hammer, Sun, CloudRain, Droplets } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const ORBIT_ICONS = [
  { Icon: Home, angle: 0 },
  { Icon: Wrench, angle: 60 },
  { Icon: Hammer, angle: 120 },
  { Icon: Sun, angle: 180 },
  { Icon: CloudRain, angle: 240 },
  { Icon: Droplets, angle: 300 },
];

export function CapabilityCards() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left — Plug & Play */}
          <div className="glow-card" style={{ padding: 32, minHeight: 280 }}>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: 'var(--text-bright)', fontSize: 22 }}
            >
              Plug &amp; Play
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)', maxWidth: 380 }}>
              Connects to your phone number and calendar in under 5 minutes. Captures leads from web forms, SMS, voice, and email. Zero engineering.
            </p>

            {/* Mini SVG chart */}
            <div style={{ position: 'relative', width: '100%', height: 120 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 120" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 90 Q50 80 80 65 Q120 45 160 55 Q200 65 240 35 Q280 10 320 25 Q360 40 400 20" stroke="#10b981" strokeWidth="2" fill="none" />
                <path d="M0 90 Q50 80 80 65 Q120 45 160 55 Q200 65 240 35 Q280 10 320 25 Q360 40 400 20 L400 120 L0 120 Z" fill="url(#chartGrad)" />
              </svg>
              {/* Tooltip badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 8,
                  background: 'var(--emerald-tint)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--emerald-bright)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald-bright)', display: 'inline-block' }} />
                Alert &middot; 14 calls today
              </div>
            </div>
          </div>

          {/* Right — Built for any business */}
          <div className="glow-card" style={{ padding: 32, minHeight: 280 }}>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: 'var(--text-bright)', fontSize: 22 }}
            >
              Built for any business
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)', maxWidth: 380 }}>
              Whether you&apos;re a roofer, HVAC pro, or solar installer &mdash; Chatty learns your script and qualifies your way.
            </p>

            {/* Orbital diagram */}
            <div style={{ position: 'relative', width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Rings */}
              <div className="orbital-ring" style={{ width: 100, height: 100, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
              <div className="orbital-ring" style={{ width: 160, height: 160, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
              <div className="orbital-ring" style={{ width: 220, height: 220, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

              {/* Center node */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--emerald-bright)',
                  boxShadow: '0 0 24px var(--emerald-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 800 }}>C</span>
              </div>

              {/* Orbiting icons */}
              {ORBIT_ICONS.map(({ Icon, angle }, i) => {
                const r = 95;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--emerald-tint)',
                      border: '1px solid var(--dark-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}
                  >
                    <Icon size={14} style={{ color: 'var(--emerald-bright)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
