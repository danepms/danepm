import { Metadata } from 'next';
import { LegalLayout } from '../../components/LegalLayout';

export const metadata: Metadata = {
  title: "Terms of Service | Dane",
  description: "Read the Terms of Service for Dane. Understand your rights, responsibilities, and the rules of using our property management software.",
};

export default function TermsOfService() {
  return (
    <LegalLayout>
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Terms of Service</h1>
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--accent)]">Effective Date: May 13, 2026</p>
      </header>

      <div className="space-y-12 text-[var(--text-muted)] text-base leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Dane ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">2. Description of Service</h2>
          <p>
            Dane is a property management platform designed to help property managers and owners track rent, manage tenant records, generate invoices, and automate communications. We provide the software infrastructure, but you remain responsible for the accuracy of the data you input and the legality of your property management operations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">3. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Security:</strong> You are responsible for safeguarding your login credentials and for any activities or actions under your account.</li>
            <li><strong>Accurate Information:</strong> You agree to provide accurate and current information regarding your portfolio and tenants.</li>
            <li><strong>Lawful Use:</strong> You must use the Service in compliance with all applicable local, state, and national laws regarding tenant rights, data privacy, and communication standards.</li>
            <li><strong>Communication Compliance:</strong> When utilizing our SMS and email broadcasting features, you agree not to send spam or abusive content.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">4. Service Availability and Updates</h2>
          <p>
            We strive to ensure 99.9% uptime, but we do not guarantee that the Service will be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) with or without notice at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Dane Properties Limited. Our trademarks may not be used in connection with any product or service without our prior written consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">6. Limitation of Liability</h2>
          <p>
            In no event shall Dane, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, resulting from your access to or use of the Service.
          </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-[var(--border)] border-opacity-10">
          <h2 className="text-xl font-black tracking-tight text-white">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at <a href="mailto:legal@danesproperties.com" className="text-[var(--accent)] hover:underline">legal@danesproperties.com</a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
