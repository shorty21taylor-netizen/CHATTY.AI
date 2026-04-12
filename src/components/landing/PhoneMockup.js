'use client';

import { Phone, Calendar, MessageCircle, BarChart3, Zap, Heart } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const FLOATING_ICONS = [
  { Icon: Phone, bg: 'rgba(59,130,246,0.2)', color: '#60a5fa', top: '15%', left: '8%' },
  { Icon: Calendar, bg: 'rgba(201,169,97,0.2)', color: '#c9a961', top: '60%', left: '5%' },
  { Icon: MessageCircle, bg: 'rgba(52,211,153,0.2)', color: '#34d399', top: '25%', right: '8%' },
  { Icon: BarChart3, bg: 'rgba(255,255,255,0.1)', color: '#f5f7f5', top: '65%', right: '6%' },
  { Icon: Zap, bg: 'rgba(250,204,21,0.15)', color: '#facc15', top: '8%', right: '22%' },
  { Icon: Heart, bg: 'rgba(244,114,182,0.15)', color: '#f472b6', bottom: '15%', left: '15%' },
];

export function PhoneMockup() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup preset="blur-slide">
          <div style={{ position: 'relative', height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Orbital rings */}
            <div className="orbital-ring" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div className="orbital-ring" style={{ width: 440, height: 440, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div className="orbital-ring" style={{ width: 580, height: 580, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

            {/* Phone frame */}
            <div
              style={{
                width: 260,
                borderRadius: 28,
                border: '2px solid var(--dark-border)',
                background: '#0a0f0d',
                boxShadow: '0 0 60px rgba(52,211,153,0.12), 0 40px 80px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                zIndex: 5,
              }}
            >
              {/* Status bar */}
              <div style={{ padding: '10px 16px 6px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                <span>9:41</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span>{'●●●●'}</span>
                  <span>{'◐'}</span>
                </div>
              </div>

              {/* Header */}
              <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={13} style={{ color: 'var(--emerald-bright)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)' }}>Chatty EA</div>
                  <div style={{ fontSize: 9, color: 'var(--emerald-bright)' }}>Online</div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Incoming */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'var(--dark-surface-2)',
                  border: '1px solid var(--dark-border)',
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'var(--text-bright)',
                  maxWidth: '90%',
                }}>
                  Good morning! You had 14 inbound calls overnight. 6 booked. Next appointment: Mike R. at 2:30pm.
                </div>

                {/* Outgoing */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '14px 14px 4px 14px',
                  background: 'rgba(52,211,153,0.15)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'var(--text-bright)',
                  maxWidth: '85%',
                  alignSelf: 'flex-end',
                }}>
                  How much revenue this week?
                </div>

                {/* Incoming */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '14px 14px 14px 4px',
                  background: 'var(--dark-surface-2)',
                  border: '1px solid var(--dark-border)',
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'var(--text-bright)',
                  maxWidth: '90%',
                }}>
                  $18,400 closed. $47K in pipeline.
                </div>
              </div>

              {/* Input bar */}
              <div style={{ padding: '8px 12px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--dark-border)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                }}>
                  Message Chatty...
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--emerald-bright)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#06140e' }}>{'\u2191'}</span>
                </div>
              </div>
            </div>

            {/* Floating icons */}
            {FLOATING_ICONS.map(({ Icon, bg, color, ...pos }, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  ...pos,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: bg,
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <Icon size={18} style={{ color }} />
              </div>
            ))}
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
