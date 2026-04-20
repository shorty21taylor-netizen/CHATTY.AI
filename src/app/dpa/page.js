'use client';

import Link from 'next/link';
import { HeroHeader } from '@/components/landing/HeroHeader';
import { Footer } from '@/components/landing/Footer';

export default function DPAPage() {
  return (
    <div style={{ background: 'var(--dark-bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <HeroHeader />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-bright)' }}>
          Data Processing Addendum
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Last updated: April 19, 2026
        </p>

        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          This Data Processing Addendum (&quot;DPA&quot;) forms part of the{' '}
          <Link href="/terms" style={{ color: 'var(--emerald-bright)' }}>
            Terms of Service
          </Link>{' '}
          between Chatty.AI (&quot;Processor&quot;) and the customer organization
          (&quot;Controller&quot;) and applies whenever Chatty.AI processes personal data on behalf
          of the Controller in connection with the Service.
        </p>

        <LegalSection title="1. Definitions">
          &quot;Personal Data,&quot; &quot;Processing,&quot; &quot;Data Subject,&quot; &quot;Data
          Controller,&quot; and &quot;Data Processor&quot; have the meanings set out in the GDPR.
          &quot;Customer Data&quot; means the personal data the Controller uploads to or generates
          through the Service. &quot;Sub-processor&quot; means a third party engaged by Chatty.AI
          to process Customer Data.
        </LegalSection>

        <LegalSection title="2. Scope and Roles">
          The Controller is the data controller of Customer Data. Chatty.AI is the data processor
          and will process Customer Data only on documented instructions from the Controller,
          including as expressed through use of the Service and this DPA.
        </LegalSection>

        <LegalSection title="3. Nature and Purpose of Processing">
          Chatty.AI will process Customer Data for the following purposes: generating daily
          intelligence briefs, operating AI voice and SMS agents, storing contact and lead
          records, logging call and message activity, computing analytics, delivering
          subscription services, and providing technical support.
        </LegalSection>

        <LegalSection title="4. Categories of Data and Data Subjects">
          Categories of data processed may include: names, phone numbers, email addresses, job
          titles, message and call transcripts, operational notes, and other business data the
          Controller chooses to upload. Data subjects may include Controller&apos;s employees,
          customers, leads, and contacts.
        </LegalSection>

        <LegalSection title="5. Confidentiality and Personnel">
          Chatty.AI ensures that personnel authorized to process Customer Data are bound by
          appropriate confidentiality obligations and receive training commensurate with their
          role.
        </LegalSection>

        <LegalSection title="6. Security Measures">
          Chatty.AI implements appropriate technical and organizational measures, including
          encryption of data in transit (TLS 1.2+) and at rest, organization-level row-level
          security, audit logging, least-privilege access controls, anomaly monitoring, and
          regular security reviews.
        </LegalSection>

        <LegalSection title="7. Sub-processors">
          The Controller authorizes Chatty.AI to engage the sub-processors listed in the{' '}
          <Link href="/privacy" style={{ color: 'var(--emerald-bright)' }}>
            Privacy Policy
          </Link>
          . Chatty.AI will maintain an up-to-date list and will notify the Controller of material
          changes at least 30 days in advance, giving the Controller an opportunity to object on
          reasonable grounds. Each sub-processor is contractually bound to substantially
          equivalent data protection obligations.
        </LegalSection>

        <LegalSection title="8. International Transfers">
          Where Chatty.AI processes Personal Data originating in the EU, UK, or Switzerland
          outside of those regions, such transfers are covered by the EU Standard Contractual
          Clauses (2021/914) or, where applicable, the UK International Data Transfer Addendum.
          By executing the Terms of Service, both parties are deemed to have signed those clauses
          as incorporated into this DPA.
        </LegalSection>

        <LegalSection title="9. Data Subject Rights Assistance">
          Chatty.AI will provide reasonable assistance (via self-service tooling in the dashboard
          and, where needed, via support) to help the Controller respond to requests from data
          subjects to exercise their rights (access, rectification, deletion, portability,
          restriction, objection).
        </LegalSection>

        <LegalSection title="10. Personal Data Breaches">
          Chatty.AI will notify the Controller without undue delay, and no later than 72 hours,
          after becoming aware of a Personal Data Breach affecting Customer Data, and will
          cooperate with the Controller&apos;s investigation and notification obligations.
        </LegalSection>

        <LegalSection title="11. Data Protection Impact Assessments">
          Chatty.AI will provide reasonable information and assistance to help the Controller
          conduct data protection impact assessments and prior consultations with supervisory
          authorities where legally required.
        </LegalSection>

        <LegalSection title="12. Return and Deletion of Data">
          On termination of the Service, the Controller may export Customer Data through
          self-service tools or by request. Chatty.AI will delete Customer Data 90 days after
          termination unless retention is required by law.
        </LegalSection>

        <LegalSection title="13. Audits">
          Chatty.AI will make available to the Controller information reasonably necessary to
          demonstrate compliance with this DPA, including security and sub-processor information.
          On-site audits may be conducted once per 12-month period with at least 30 days&apos;
          notice, subject to reasonable confidentiality and security requirements.
        </LegalSection>

        <LegalSection title="14. No Training on Controller Data">
          Chatty.AI does not use Customer Data to train foundation AI models. Customer Data may
          be used to generate model outputs for the Controller&apos;s benefit (e.g. retrieval,
          embeddings, prompts) but is not aggregated into model training sets shared with other
          customers.
        </LegalSection>

        <LegalSection title="15. Liability">
          The liability cap set out in the{' '}
          <Link href="/terms" style={{ color: 'var(--emerald-bright)' }}>
            Terms of Service
          </Link>{' '}
          applies to this DPA in the aggregate, including all claims under data protection law
          arising out of the Service.
        </LegalSection>

        <LegalSection title="16. Contact">
          For DPA-related questions or to request execution of a countersigned copy, email{' '}
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
