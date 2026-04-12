'use client';

import { useState } from 'react';
import { ShieldCheck, BarChart3, DollarSign } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const TABS = ['Real Results', 'Real Customers', 'Real ROI'];

const TAB_CONTENT = {
  'Real Results': {
    pill: 'Realistic scenarios',
    features: [
      { Icon: ShieldCheck, title: 'Answer Rate', body: '99.4% of all inbound calls picked up in under 1 second.' },
      { Icon: BarChart3, title: 'Booking Rate', body: '41% of qualified leads booked directly into your calendar.' },
      { Icon: DollarSign, title: 'Revenue Recovered', body: '$47,200 in missed-call revenue recovered last 30 days.' },
    ],
  },
  'Real Customers': {
    pill: 'Verified operators',
    features: [
      { Icon: ShieldCheck, title: '200+ Businesses', body: 'Dental offices, HVAC, coaching, salons, and more trust Chatty.' },
      { Icon: BarChart3, title: '4.9/5 Satisfaction', body: 'Operators consistently rate Chatty above human receptionists.' },
      { Icon: DollarSign, title: '< 2 Min Setup', body: 'Average time from sign-up to first call answered by Chatty.' },
    ],
  },
  'Real ROI': {
    pill: 'Proven returns',
    features: [
      { Icon: ShieldCheck, title: '486x ROI', body: 'Average return on a $97/mo plan based on recovered revenue.' },
      { Icon: BarChart3, title: '$2,400 Avg Deal', body: 'Mean deal size across all Chatty-qualified appointments.' },
      { Icon: DollarSign, title: 'Pays for Itself', body: 'One booked appointment covers your entire annual subscription.' },
    ],
  },
};

export function TrustSection() {
  const [activeTab, setActiveTab] = useState('Real Results');
  const content = TAB_CONTENT[activeTab];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>
              Why operators trust Chatty
            </div>
            <h2
              className="font-bold max-w-xl"
              style={{ fontSize: 44, color: 'var(--text-bright)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Built for the businesses that hate missing calls.
            </h2>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <AnimatedGroup preset="fade" key={activeTab}>
          <div className="glow-card" style={{ padding: '40px 36px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 14px',
                borderRadius: 999,
                background: 'rgba(212,255,79,0.1)',
                border: '1px solid rgba(212,255,79,0.2)',
                fontSize: 11,
                fontWeight: 600,
                color: '#d4ff4f',
                marginBottom: 28,
              }}
            >
              {content.pill}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {content.features.map(({ Icon, title, body }) => (
                <div key={title} className="flex items-start">
                  <div className="feature-icon-sm">
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1" style={{ fontSize: 15, color: 'var(--text-bright)' }}>
                      {title}
                    </div>
                    <p className="m-0 leading-relaxed" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
