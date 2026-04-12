'use client';

import { Phone, CheckCircle, Calendar, MessageCircle, PhoneOutgoing, BarChart3 } from 'lucide-react';
import { AnimatedGroup } from '@/components/ui/AnimatedGroup';

const ITEMS = [
  { Icon: Phone, title: 'Always Answering', body: 'Sub-1-second pickup, 24/7. Never miss a call again.' },
  { Icon: CheckCircle, title: 'Lead Qualification', body: 'Asks the right questions, scores every lead automatically.' },
  { Icon: Calendar, title: 'Calendar Booking', body: 'Books appointments directly into your calendar.' },
  { Icon: MessageCircle, title: 'Telegram EA', body: 'Text your assistant for instant performance updates.' },
  { Icon: PhoneOutgoing, title: 'Outbound Dialing', body: 'AI agents that call your lead lists while you sleep.' },
  { Icon: BarChart3, title: 'Real-Time Analytics', body: 'Track every call, conversion, and dollar earned.' },
];

export function InlineFeatures() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup preset="blur-slide" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {ITEMS.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start">
              <div className="feature-icon-sm">
                <Icon size={15} />
              </div>
              <div>
                <div
                  className="font-semibold mb-1"
                  style={{ fontSize: 15, color: 'var(--text-bright)' }}
                >
                  {title}
                </div>
                <p
                  className="m-0 leading-relaxed"
                  style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260 }}
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
