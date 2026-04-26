import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Euro Hotel',
  description: 'Terms and conditions for staying at Euro Hotel, Hyderabad.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-off-white">
      <SolidHeader />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl font-semibold text-navy-900 mb-2">Terms of Service</h1>
          <p className="text-charcoal-500 text-sm mb-10">Effective Date: January 1, 2025</p>

          <div className="prose prose-lg max-w-none text-charcoal-700 space-y-10">

            <p className="text-charcoal-600 leading-relaxed">
              These terms and conditions apply to all guests staying at Euro Hotel, Hyderabad. By making a reservation or checking in, you agree to abide by all policies listed below. These terms are designed to ensure comfort, safety, and a pleasant experience for all guests.
            </p>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">1. General Hotel Policies</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>All guests must present a valid government-issued photo identification (Aadhaar, Passport, Driving Licence, or Voter ID) at check-in.</li>
                <li>The hotel reserves the right to refuse accommodation to any guest who violates hotel rules or whose conduct is deemed inappropriate.</li>
                <li>Guests are solely responsible for their personal belongings. Euro Hotel shall not be liable for any loss, theft, or damage to personal property during the stay.</li>
                <li>Room keys and access cards remain the property of the hotel and must be returned at check-out.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">2. Check-in & Check-out</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Standard check-in time: <strong>2:00 PM (14:00 hrs)</strong></li>
                <li>Standard check-out time: <strong>12:00 PM (12:00 hrs)</strong></li>
                <li>Early check-in and late check-out are subject to room availability and may attract additional charges.</li>
                <li>Guests who have not vacated by the agreed check-out time may be charged an additional night.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">3. Reservations & Cancellations</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Reservations are confirmed only upon receipt of payment or a valid payment guarantee.</li>
                <li>Free cancellation is available up to <strong>48 hours</strong> prior to the scheduled check-in date.</li>
                <li>Cancellations made within 48 hours of check-in may be subject to a one-night retention charge.</li>
                <li>No-show reservations will be charged one night's room rate unless otherwise stated at the time of booking.</li>
                <li>The hotel reserves the right to cancel a reservation in exceptional circumstances, including force majeure events.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">4. Payment Policy</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Payments are accepted via cash, credit/debit card, UPI, and other approved digital payment methods.</li>
                <li>Full or partial advance payment may be required at the time of booking or check-in.</li>
                <li>All room rates are exclusive of applicable taxes unless stated otherwise. GST and other statutory charges will be added as applicable.</li>
                <li>The hotel is not responsible for any bank charges, currency conversion fees, or transaction fees levied by your financial institution.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">5. Guest Conduct</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Guests are expected to maintain decorum and show respect toward other guests, hotel staff, and hotel property at all times.</li>
                <li>Loud noise, disruptive behaviour, or any activity that disturbs other guests is strictly prohibited.</li>
                <li>Illegal activities, possession of weapons, narcotics, or hazardous materials on hotel premises is strictly forbidden and may result in immediate eviction and reporting to law enforcement.</li>
                <li>The hotel reserves the right to evict any guest causing disturbance or violating hotel rules without a refund.</li>
                <li>Visitors to guest rooms must be registered at the front desk. Overnight guests must be declared at check-in.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">6. Children & Extra Beds</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Children below 6 years of age may stay complimentary when sharing existing bedding with parents.</li>
                <li>Children above 6 years are considered adults for room occupancy purposes.</li>
                <li>Extra beds and rollaway beds are subject to room availability and will attract additional charges.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">7. Smoking & Alcohol</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Euro Hotel is a designated non-smoking property. Smoking is permitted only in designated outdoor areas.</li>
                <li>Guests found smoking in non-designated areas, including guest rooms, will be charged a deep-cleaning fee.</li>
                <li>Consumption of alcohol is permitted only in licensed areas of the hotel and in accordance with applicable laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">8. Pet Policy</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Pets are not permitted on hotel premises unless expressly agreed upon at the time of booking.</li>
                <li>Guests are fully responsible for any damage caused by their pets and will be charged accordingly.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">9. Safety & Security</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Guests must comply with all hotel safety instructions and emergency evacuation procedures.</li>
                <li>CCTV surveillance is operational in all public areas of the hotel for the safety and security of all guests.</li>
                <li>The hotel reserves the right to conduct security checks when deemed necessary.</li>
                <li>In the event of an emergency, guests must follow instructions provided by hotel staff immediately.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">10. Damage & Loss</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Guests will be held liable for any damage caused to hotel property, furniture, fixtures, or equipment during their stay.</li>
                <li>The cost of repair or replacement will be charged to the guest's account.</li>
                <li>Lost key cards, remote controls, or other hotel equipment may attract replacement charges.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">11. Amendments</h2>
              <p className="text-charcoal-600">
                Euro Hotel reserves the right to amend, update, or revise these terms and conditions at any time without prior notice. The most current version will always be available at the front desk and on our website. Continued use of hotel services constitutes acceptance of any revised terms.
              </p>
            </section>

            <section className="bg-muted-beige rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold text-navy-900 mb-2">Acceptance of Terms</h2>
              <p className="text-charcoal-600">
                By completing a reservation or checking in at Euro Hotel, you confirm that you have read, understood, and agreed to all terms and conditions stated above. For queries, please contact us at{' '}
                <a href="mailto:reservations@eurohotel.in" className="text-gold-600 hover:underline">reservations@eurohotel.in</a>{' '}
                or call{' '}
                <a href="tel:+917729900091" className="text-gold-600 hover:underline">+91 77299 00091</a>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
