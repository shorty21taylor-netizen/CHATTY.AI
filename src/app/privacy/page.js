'use client';

import Link from 'next/link';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--dark-bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <HeroHeader />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Last updated: April 19, 2026
        </p>

        <LegalSection title="1. Who We Are">
          Chatty.AI (&quot;we,&quot; &quot;us&quot;) is the data controller for information
          collected through our marketing site and a data processor for information you upload
          through the Service. If you are in the EU, UK, or California, regional laws may apply
          to you.
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          We collect three categories of information: (a) account data (name, email, organization,
          role, phone number) provided during signup; (b) usage data (dashboard activity, briefs
          opened, feedback given, API calls) generated automatically through use; (c) operational
          data you upload (contacts, leads, messages, call transcripts) to enable the Service.
        </LegalSection>

        <LegalSection title="3. How We Use Information">
          We process data to: operate and improve the Service; generate daily briefs and AI
          recommendations; send SMS and voice messages you request; bill your organization; detect
          abuse; and meet legal obligations. We do not sell personal information. We do not train
          our AI models on your operational data without your explicit consent.
        </LegalSection>

        <LegalSection title="4. Sub-processors">
          We rely on trusted sub-processors to operate the Service:
          <br />
          <br />
          • Anthropic (Claude models — AI reasoning)
          <br />
          • ElevenLabs (voice synthesis and conversational AI)
          <br />
          • Twilio (SMS and voice delivery)
          <br />
          • Stripe (payments)
          <br />
          • Clerk (authentication and organization management)
          <br />
          • Railway (hosting and database)
          <br />
          • Inngest (background job orchestration)
          <br />
          • Voyage AI (semantic embeddings)
          <br />
          <br />
          Each sub-processor is contractually bound to handle your data with at least the level
          of protection described in this policy.
        </LegalSection>

        <LegalSection title="5. Data Retention">
          Account data is retained for the lifetime of your subscription plus 30 days. Operational
          data is retained for 90 days after subscription termination, then permanently deleted.
          You can request earlier deletion at any time through the billing portal or by emailing
          us.
        </LegalSection>

        <LegalSection title="6. Security">
          We use industry-standard security: TLS 1.2+ in transit, encryption at rest for
          credentials and databases, row-level security enforcing organization isolation, and
          least-privilege access for our engineering team. We log and monitor for anomalous
          access. If a breach affects your data, we will notify you within 72 hours of discovery.
        </LegalSection>

        <LegalSection title="7. Your Rights">
          Depending on your jurisdiction, you may have the right to: access the personal data we
          hold about you; correct inaccurate data; delete your data; restrict or object to certain
          processing; receive a portable copy of your data; and lodge a complaint with a
          supervisory authority. To exercise these rights, email{' '}
          <a href="mailto:privacy@chatty.ai" style={{ color: 'var(--emerald-bright)' }}>
            privacy@chatty.ai
          </a>
          .
        </LegalSection>

        <LegalSection title="8. Cookies and Tracking">
          We use essential cookies for authentication and session management. We do not use
          advertising cookies or sell behavioral data. A small amount of first-party analytics is
          collected to measure product usage (e.g. which dashboard pages are visited) — you can
          opt out in account settings.
        </LegalSection>

        <LegalSection title="9. International Transfers">
          Our servers are hosted in the United States. If you access the Service from outside the
          US, your data will be transferred to and processed in the US. Where required (for EU/UK
          customers), we rely on Standard Contractual Clauses as the legal basis for transfers.
          See our{' '}
          <Link href="/dpa" style={{ color: 'var(--emerald-bright)' }}>
            Data Processing Addendum
          </Link>{' '}
          for details.
        </LegalSection>

        <LegalSection title="10. Children's Privacy">
          The Service is not intended for individuals under 18. We do not knowingly collect
          information from children.
        </LegalSection>

        <LegalSection title="11. Changes to This Policy">
          Material changes to this policy will be announced via email or in-product notification
          at least 14 days before they take effect.
        </LegalSection>

        <LegalSection title="12. Contact">
          For privacy questions or requests, email{' '}
          <a href="mailto:privacy@chatty.ai" style={{ color: 'var(--emerald-bright)' }}>
            privacy@chatty.ai
          </a>
          .
        </LegalSection>
      </main>
      <Footer />
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-bright)' }}>
        {title}
      </h2>
      <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </p>
    </section>
  );
}
