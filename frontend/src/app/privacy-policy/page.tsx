import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';
import PolicyNav from '@/components/PolicyNav';

export const metadata = {
  title: 'Privacy Policy | Euro Hotel',
  description: 'How Euro Hotel collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <SolidHeader />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl font-semibold text-navy-900 mb-2">Privacy Policy</h1>
          <p className="text-charcoal-500 text-sm mb-10">Effective Date: July 18, 2026</p>

          <div className="prose prose-lg max-w-none text-charcoal-700 space-y-10">

            <p className="text-charcoal-600 leading-relaxed">
              Euro Hotel (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website or stay at our property located in Hyderabad, Telangana, India.
            </p>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">1. Information We Collect</h2>
              <p className="text-charcoal-600 mb-3">We collect the following types of personal information:</p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li><strong>Account Information:</strong> Name, email address, phone number, and a password (stored only in encrypted form by our authentication provider) if you create an account.</li>
                <li><strong>Reservation Details:</strong> Guest name, email address, phone number, check-in and check-out dates, number of guests, rooms selected, and any special requests or cancellation reason you provide.</li>
                <li><strong>Payment Information:</strong> Order reference, amount, payment status and the transaction reference returned by our payment gateway. Card details are entered on the gateway&apos;s own secure page — <strong>we never receive or store your card number, CVV, or UPI PIN</strong>.</li>
                <li><strong>Enquiries:</strong> Name, email, phone and message when you use our contact or table-reservation forms.</li>
                <li><strong>Usage Data:</strong> IP address, browser type, pages viewed and links clicked on our website, collected through analytics cookies.</li>
                <li><strong>At the Hotel:</strong> A valid government-issued photo ID is verified at check-in as required by law, and CCTV operates in public areas for security. This is collected at the property, not through this website.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-charcoal-600 mb-3">We use your personal information to:</p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Process and manage your reservation and stay.</li>
                <li>Verify your identity at check-in as required by applicable laws.</li>
                <li>Process payments and issue invoices or receipts.</li>
                <li>Communicate important information about your booking, including confirmations and updates.</li>
                <li>Provide customer support and respond to your queries or complaints.</li>
                <li>Comply with legal obligations, including reporting to government authorities as mandated by law.</li>
                <li>Process cancellation requests and refunds.</li>
                <li>Improve our services, website, and overall guest experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-charcoal-600">
                We process your personal data on the following legal grounds: (a) performance of a contract — to fulfil your reservation; (b) legal obligation — to comply with Indian laws including the Foreigners Act, 1946 and hotel registration requirements; (c) legitimate interests — to operate and improve our hotel services; and (d) your consent — for marketing communications, which you may withdraw at any time.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">4. Sharing of Information</h2>
              <p className="text-charcoal-600 mb-3">We do not sell your personal information. We may share it with:</p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li><strong>Government Authorities:</strong> As required by Indian law, guest details may be shared with local police or immigration authorities.</li>
                <li><strong>Payment Gateway:</strong> HDFC Bank&apos;s payment gateway, which receives your name, email, phone and booking amount in order to process the transaction on its own secure page.</li>
                <li><strong>Service Providers:</strong> Trusted vendors who help us run this website and communicate with you — our cloud hosting and authentication provider (Supabase) and our email provider — under confidentiality obligations.</li>
                <li><strong>Analytics &amp; Advertising Partners:</strong> Aggregated and securely hashed (pseudonymised) data may be shared with Google (Google Analytics and Google Ads) and Meta (Facebook Pixel) to measure website performance, conversions, and the effectiveness of our advertising. See Section 7 for details.</li>
                <li><strong>Legal Compliance:</strong> When required by a court order, law enforcement, or other legal process.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">5. Data Retention</h2>
              <p className="text-charcoal-600">
                We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, or as required by law. Reservation and payment records are typically retained for a minimum of 3 years to meet tax and accounting requirements. CCTV footage is retained for up to 30 days unless required for an ongoing investigation. You may ask us to delete your account at any time; bookings already completed will be retained as required by law.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">6. Data Security</h2>
              <p className="text-charcoal-600">
                We implement appropriate technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. These include encrypted data transmission (HTTPS), restricted access controls, and regular security assessments. However, no method of electronic transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">7. Cookies, Analytics &amp; Advertising</h2>
              <p className="text-charcoal-600 mb-3">
                Our website uses cookies and similar technologies to enhance your browsing experience, analyse traffic, and measure the performance of our marketing. Specifically, we use:
              </p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li><strong>Google Analytics (GA4):</strong> to understand how visitors use our website — pages viewed, time on site, general location, and which buttons and links are clicked. This data is aggregated and is not used to identify you personally.</li>
                <li><strong>Google Ads &amp; Enhanced Conversions:</strong> to measure the effectiveness of our advertising. When you sign up, submit an enquiry, or complete a booking, limited information you provide (such as your email address, phone number, or name) may be irreversibly <strong>hashed</strong> (encrypted using SHA-256) within your browser before being shared with Google to attribute conversions to our ads. Google does not receive this information in a readable form.</li>
                <li><strong>Meta Pixel (Facebook):</strong> to measure and improve our advertising on Facebook and Instagram.</li>
              </ul>
              <p className="text-charcoal-600 mt-3">
                You can manage cookies through your browser settings, opt out of Google Analytics using the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>, and control personalised advertising through{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">Google Ad Settings</a>{' '}
                and your{' '}
                <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">Meta Ad Preferences</a>. Disabling cookies may affect certain features of the website.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">8. Your Rights</h2>
              <p className="text-charcoal-600 mb-3">Subject to applicable law, you have the right to:</p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Access the personal information we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request deletion of your data, subject to our legal obligations.</li>
                <li>Withdraw consent for marketing communications at any time.</li>
                <li>Lodge a complaint with the relevant data protection authority.</li>
              </ul>
              <p className="text-charcoal-600 mt-3">
                To exercise any of these rights, please contact us at <a href="mailto:reservation@eurohotel.in" className="text-gold-600 hover:underline">reservation@eurohotel.in</a>.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">9. Third-Party Links</h2>
              <p className="text-charcoal-600">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any external websites you visit.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-charcoal-600">
                Our services are not directed to children under the age of 18 without parental or guardian consent. We do not knowingly collect personal information from minors independently.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-charcoal-600">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically. Continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="bg-muted-beige rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold text-navy-900 mb-2">Contact Us</h2>
              <p className="text-charcoal-600">
                For any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
              </p>
              <div className="mt-3 space-y-1 text-charcoal-700">
                <p><strong>Euro Hotel</strong></p>
                <p>Opp Post Office, Mumbai Highway, Rudraram Village</p>
                <p>Patancheru Mandal, Sangareddy Dist, Telangana – 502329</p>
                <p>Email: <a href="mailto:reservation@eurohotel.in" className="text-gold-600 hover:underline">reservation@eurohotel.in</a></p>
                <p>Phone: <a href="tel:+917729900091" className="text-gold-600 hover:underline">+91 77299 00091</a></p>
              </div>
            </section>

          </div>

          <PolicyNav current="/privacy-policy" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
