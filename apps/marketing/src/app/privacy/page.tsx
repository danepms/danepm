import { Metadata } from 'next';
import { LegalLayout } from '../../components/LegalLayout';

export const metadata: Metadata = {
  title: "Privacy Policy | Dane",
  description: "Learn how Dane collects, uses, and protects your property management data. Clear, transparent, and built for your security.",
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout>
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Privacy Policy</h1>
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--accent)]">Effective Date: May 13, 2026</p>
      </header>

      <div className="space-y-12 text-[var(--text-muted)] text-base leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">1. Information We Collect</h2>
          <p>
            When you use Dane, we collect information that helps us provide you with our property management services. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Details:</strong> Your name, email, phone number, and security credentials.</li>
            <li><strong>Portfolio Data:</strong> Property addresses, unit configurations, and ownership structures.</li>
            <li><strong>Tenant Information:</strong> Contacts, identification details, lease terms, and arrears ledgers that you input into the system.</li>
            <li><strong>System Logs:</strong> Audit logs of actions taken within your dashboard (e.g., generating invoices, sending communications).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">2. How We Use Your Data</h2>
          <p>We use your data strictly to deliver and improve our platform. Specifically, we use it to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Authenticate your access and secure your manager profile.</li>
            <li>Process automated communications (SMS and Email) to your tenants via our verified gateways.</li>
            <li>Generate financial reports and arrears ledgers based on your inputs.</li>
            <li>Provide customer support and resolve technical issues.</li>
          </ul>
          <p className="mt-4 border-l-2 border-[var(--accent)] pl-4 italic">
            Dane does not sell your data. Your tenant lists and financial records remain strictly confidential.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">3. Data Sharing and Integrations</h2>
          <p>
            We only share data with trusted third-party infrastructure providers necessary to operate the service. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Communication Gateways:</strong> Providers like ZeptoMail and Africa's Talking to dispatch your broadcasts.</li>
            <li><strong>Hosting Providers:</strong> Secure cloud infrastructure where our databases and applications reside.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">4. Data Security</h2>
          <p>
            We implement industry-standard security measures, including encryption at rest and in transit, strict access controls, and regular system audits. Features like Two-Factor Authentication (2FA) are available to further secure your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. If you wish to export your tenant registry or permanently delete your account, you can do so through the Settings panel or by contacting our support team.
          </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-[var(--border)] border-opacity-10">
          <h2 className="text-xl font-black tracking-tight text-white">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@danesproperties.com" className="text-[var(--accent)] hover:underline">privacy@danesproperties.com</a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
