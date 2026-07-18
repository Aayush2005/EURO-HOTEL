import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';
import PolicyNav from '@/components/PolicyNav';

export const metadata = {
  title: 'Cancellation & Refund Policy | Euro Hotel',
  description: 'Cancellation, modification, and refund terms for reservations at Euro Hotel, Hyderabad.',
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-off-white">
      <SolidHeader />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl font-semibold text-navy-900 mb-2">Cancellation &amp; Refund Policy</h1>
          <p className="text-charcoal-500 text-sm mb-10">Effective Date: July 18, 2026</p>

          <div className="prose prose-lg max-w-none text-charcoal-700 space-y-10">

            <p className="text-charcoal-600 leading-relaxed">
              At Euro Hotel, we strive to provide a seamless booking experience while maintaining fairness for our guests and operations. Please review our cancellation and refund policy before confirming your reservation.
            </p>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">1. Reservation Confirmation</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Reservations are confirmed only upon receipt of the applicable advance payment or a valid payment guarantee.</li>
                <li>Guests will receive a booking confirmation via email or SMS once the reservation is successfully confirmed.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">2. Cancellation Policy</h2>
              <h3 className="font-serif text-lg font-semibold text-navy-900 mb-2">Standard Reservations</h3>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Free cancellation is available up to <strong>48 hours</strong> prior to the scheduled check-in date and time.</li>
                <li>Cancellations made within 48 hours of the check-in date will incur a cancellation charge equivalent to one night&apos;s room tariff.</li>
                <li>In the event of a No-Show, the first night&apos;s room charges will be retained, and the remaining booking may be cancelled at the hotel&apos;s discretion.</li>
              </ul>
              <h3 className="font-serif text-lg font-semibold text-navy-900 mt-5 mb-2">Non-Refundable Bookings</h3>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Reservations booked under promotional, discounted, advance purchase, or non-refundable rates cannot be cancelled, modified, or refunded.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">3. Refund Policy</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Eligible refunds will be processed to the original mode of payment.</li>
                <li>Refunds are generally processed within <strong>7&ndash;10 business days</strong>, subject to banking and payment gateway timelines.</li>
                <li>Any applicable transaction charges or payment gateway fees may be deducted wherever applicable.</li>
                <li>Refunds for bookings made through Online Travel Agencies (OTA) such as MakeMyTrip, Goibibo, Booking.com, Agoda, etc., will be processed according to the respective platform&apos;s policies.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">4. Modification of Reservation</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Changes to booking dates or room category are subject to room availability and prevailing room rates.</li>
                <li>Rate differences may apply for modifications.</li>
                <li>Date changes requested within 48 hours of arrival may be treated as cancellations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">5. Early Check-Out</h2>
              <p className="text-charcoal-600">
                Guests checking out before the confirmed departure date may be charged an early departure fee equivalent to one night&apos;s room tariff, unless otherwise agreed by the hotel management.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">6. Group Bookings &amp; Banquet Reservations</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Group reservations (5 rooms or more) and banquet/event bookings are governed by separate cancellation terms mentioned in the booking agreement.</li>
                <li>Advance payments for events and banquet bookings may be non-refundable unless otherwise specified in the signed contract.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">7. Force Majeure</h2>
              <p className="text-charcoal-600 mb-3">
                Euro Hotel shall not be held responsible for cancellations or service interruptions caused by circumstances beyond its reasonable control, including but not limited to:
              </p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Natural disasters</li>
                <li>Government restrictions</li>
                <li>Pandemics</li>
                <li>Civil disturbances</li>
                <li>Power or utility failures</li>
                <li>Other force majeure events</li>
              </ul>
              <p className="text-charcoal-600 mt-3">
                In such cases, the hotel reserves the right to offer alternative booking dates or refunds at its sole discretion.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">8. Hotel&apos;s Right to Cancel</h2>
              <p className="text-charcoal-600 mb-3">Euro Hotel reserves the right to cancel or refuse any reservation due to:</p>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Incorrect or fraudulent booking information</li>
                <li>Payment failure</li>
                <li>Overbooking caused by unforeseen operational circumstances</li>
                <li>Force majeure situations</li>
                <li>Violation of hotel policies</li>
              </ul>
              <p className="text-charcoal-600 mt-3">
                Where applicable, a full refund of the amount received will be processed.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">9. Notes</h2>
              <ul className="space-y-2 list-disc list-inside text-charcoal-600">
                <li>Cancellation requests are considered valid only after written confirmation from Euro Hotel.</li>
                <li>The hotel&apos;s decision regarding cancellation charges and refunds shall be final and in accordance with the applicable booking terms.</li>
                <li>This policy is subject to change without prior notice.</li>
              </ul>
            </section>

            <section className="bg-muted-beige rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold text-navy-900 mb-2">Contact for Cancellation &amp; Refund Assistance</h2>
              <p className="text-charcoal-600">
                For reservation changes, cancellations, or refund-related queries, please contact:
              </p>
              <div className="mt-3 space-y-1 text-charcoal-700">
                <p><strong>Reservations Team, Euro Hotel</strong></p>
                <p>Opp Post Office, Mumbai Highway, Rudraram Village</p>
                <p>Patancheru Mandal, Sangareddy Dist, Telangana – 502329</p>
                <p>Email: <a href="mailto:reservation@eurohotel.in" className="text-gold-600 hover:underline">reservation@eurohotel.in</a></p>
                <p>Phone: <a href="tel:+917729900091" className="text-gold-600 hover:underline">+91 77299 00091</a></p>
              </div>
            </section>

          </div>

          <PolicyNav current="/cancellation-policy" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
