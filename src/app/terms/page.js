'use client';

import Link from 'next/link';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { Footer } from '@/components/landing/Footer';

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--dark-bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <HeroHeader />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>
          Terms of Service
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Last updated: April 19, 2026
        </p>

        <LegalSection title="1. Acceptance of Terms">
          By accessing or using Chatty.AI (the &quot;Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree to these terms, do not use the Service. These
          terms form a binding agreement between you (and the organization you represent) and
          Chatty.AI.
        </LegalSection>

        <LegalSection title="2. The Service">
          Chatty.AI is an AI-powered sales and operations platform for home service contractors.
          The Service includes dashboards, daily briefs, AI voice agents, SMS automation, and
          related features. We may add, remove, or change features at any time.
        </LegalSection>

        <LegalSection title="3. Your Account and Organization">
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your organization&apos;s account. You agree to provide
          accurate information during signup and to keep it up to date. You may not share a single
          seat across multiple users.
        </LegalSection>

        <LegalSection title="4. Acceptable Use">
          You agree not to: (a) use the Service to send unlawful, deceptive, or unsolicited
          communications (including SMS or voice calls that violate TCPA, CAN-SPAM, or similar
          laws); (b) reverse engineer or resell the Service; (c) attempt to access data belonging
          to other organizations; (d) upload malicious code or interfere with Service
          infrastructure. You are solely responsible for obtaining consent from the recipients of
          any message or call sent through the Service.
        </LegalSection>

        <LegalSection title="5. Subscription, Billing, and Cancellation">
          Paid plans are billed monthly or annually through Stripe. Fees are non-refundable except
          where required by law. You may cancel at any time through the billing portal; access
          continues through the end of the current billing period. Failed payments may result in
          suspension of the Service after a 7-day grace period.
        </LegalSection>

        <LegalSection title="6. Data and Privacy">
          Your data is handled in accordance with our{' '}
          <Link href="/privacy" style={{ color: 'var(--emerald-bright)' }}>
            Privacy Policy
          </Link>
          . For organizations that process personal data of EU or UK residents, our{' '}
          <Link href="/dpa" style={{ color: 'var(--emerald-bright)' }}>
            Data Processing Addendum
          </Link>{' '}
          applies and is incorporated by reference.
        </LegalSection>

        <LegalSection title="7. AI Outputs">
          Chatty.AI generates recommendations, briefs, and messages using AI models. These outputs
          are suggestions, not professional advice. You are responsible for reviewing AI-generated
          content before sending it to customers, employees, or third parties. We do not guarantee
          the accuracy, completeness, or suitability of any AI output.
        </LegalSection>

        <LegalSection title="8. Third-Party Services">
          The Service integrates with third-party providers including Twilio (SMS and voice),
          ElevenLabs (AI voice), Anthropic (Claude models), Stripe (payments), and Clerk
          (authentication). Your use of those integrations is also governed by their respective
          terms. We are not responsible for third-party outages or policy changes.
        </LegalSection>

        <LegalSection title="9. Intellectual Property">
          We retain all rights to the Service, including its software, models, prompts, and brand.
          You retain all rights to the data you upload. You grant us a limited license to process
          your data solely to operate and improve the Service for your organization.
        </LegalSection>

        <LegalSection title="10. Warranties and Disclaimers">
          The Service is provided &quot;as is&quot; without warranty of any kind. To the fullest
          extent permitted by law, we disclaim all implied warranties, including merchantability,
          fitness for a particular purpose, and non-infringement.
        </LegalSection>

        <LegalSection title="11. Limitation of Liability">
          To the fullest extent permitted by law, our aggregate liability for any claim arising
          out of or relating to the Service is limited to the amount you paid us in the 12 months
          preceding the claim. We are not liable for indirect, incidental, special, consequential,
          or punitive damages.
        </LegalSection>

        <LegalSection title="12. Termination">
          Either party may terminate this agreement at any time. We may suspend or terminate
          access for breach of these terms, abuse of the Service, or failure to pay. On
          termination, your data is retained for 30 days and then permanently deleted.
        </LegalSection>

        <LegalSection title="13. Changes to These Terms">
          We may update these terms from time to time. Material changes will be announced via
          email or in-product notification at least 14 days before they take effect. Continued use
          of the Service after the effective date constitutes acceptance.
        </LegalSection>

        <LegalSection title="14. Contact">
          Questions about these terms? Email us at{' '}
          <a href="mailto:legal@chatty.ai" style={{ color: 'var(--emerald-bright)' }}>
            legal@chatty.ai
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
