import { Metadata } from 'next';
import { LegalLayout } from '../../components/LegalLayout';

export const metadata: Metadata = {
  title: "Cookie Policy | Dane",
  description: "Learn how Dane uses cookies to improve your experience, secure your account, and provide essential property management features.",
};

export default function CookiePolicy() {
  return (
    <LegalLayout>
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Cookie Policy</h1>
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--accent)]">Effective Date: May 13, 2026</p>
      </header>

      <div className="space-y-12 text-[var(--text-muted)] text-base leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, provide a secure browsing experience, and remember your preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">2. How We Use Cookies</h2>
          <p>
            Dane primarily uses cookies to ensure the core functionality and security of our platform. We do not use aggressive tracking cookies or sell your browsing data to third-party advertisers. Our cookies are categorized as follows:
          </p>
          <ul className="list-disc pl-5 space-y-4 mt-4">
            <li>
              <strong className="text-white block mb-1">Essential Cookies</strong>
              These are strictly necessary to provide you with the Service. For example, we use session cookies to keep you logged in to your Manager or Owner portal securely as you navigate between pages.
            </li>
            <li>
              <strong className="text-white block mb-1">Performance and Analytics Cookies</strong>
              We use lightweight analytics tools to understand how users interact with our platform (e.g., which features are used most). This data is aggregated and anonymized, helping us improve the software.
            </li>
            <li>
              <strong className="text-white block mb-1">Functional Cookies</strong>
              These allow our platform to remember choices you make (such as your preferred property view or timezone) to provide a more personalized experience.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">3. Third-Party Cookies</h2>
          <p>
            In some cases, we use trusted third-party services that may also place cookies on your device. For instance, our secure authentication provider utilizes cookies to verify your identity and prevent fraudulent login attempts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-white">4. Managing Your Cookie Preferences</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject essential cookies, you may still use our marketing website, but you will not be able to log in to the Dane application portals.
          </p>
          <p>
            To learn more about how to manage cookies through your browser settings, please consult your browser's help menu.
          </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-[var(--border)] border-opacity-10">
          <h2 className="text-xl font-black tracking-tight text-white">Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at <a href="mailto:privacy@danesproperties.com" className="text-[var(--accent)] hover:underline">privacy@danesproperties.com</a>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
