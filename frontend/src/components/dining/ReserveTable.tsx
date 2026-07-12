'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';
import { trackAdsConversion, splitName } from '@/lib/ads-conversions';

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

const ReserveTable = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    date: '',
    timeHour: '',
    timeMinute: '',
    timeMeridiem: '',
    specialRequests: '',
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Allow reservations from today up to 7 days in the future only.
  // (Computed on the client — this section renders after mount via SimplePageWrapper.)
  const today = new Date();
  const maxDay = new Date();
  maxDay.setDate(today.getDate() + 7);
  const minDate = formatDate(today);
  const maxDate = formatDate(maxDay);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const time =
        formData.timeHour && formData.timeMeridiem
          ? `${formData.timeHour}:${formData.timeMinute || '00'} ${formData.timeMeridiem}`
          : '';

      // Log reservation data for future FastAPI / Supabase integration.
      console.log('Dining Reservation Data:', { ...formData, time });

      // Simulate processing time.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Google Ads enhanced conversion — reservation lead.
      const { firstName, lastName } = splitName(formData.name);
      trackAdsConversion('contact', {
        user: { email: formData.email, phone: formData.phone, firstName, lastName },
      });

      setMessage('Thank you! Your table request has been received. We will confirm your reservation shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        guests: '',
        date: '',
        timeHour: '',
        timeMinute: '',
        timeMeridiem: '',
        specialRequests: '',
      });
      setCountryCode('+91');
      setPhoneNumber('');
    } catch {
      setMessage('Sorry, there was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setPhoneNumber(digitsOnly);
      setFormData({ ...formData, phone: `${countryCode}${digitsOnly}` });
    } else if (name === 'guests') {
      // Numbers only.
      setFormData({ ...formData, guests: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCountryCodeChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    setFormData({ ...formData, phone: `${newCountryCode}${phoneNumber}` });
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 transition-colors';
  const optionalLabel = <span className="text-charcoal-400 font-normal">(optional)</span>;

  return (
    <section id="reserve" className="py-20 bg-off-white">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-sm text-gold-600 uppercase tracking-widest font-medium mb-4">
            Reservation
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-navy-900 mb-4">
            Reserve Your <span className="text-gold-600">Table</span>
          </h2>
          <p className="text-charcoal-700 font-light max-w-2xl mx-auto">
            Make your dining experience effortless by reserving your preferred date and time.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto premium-card p-8 md:p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email Address {optionalLabel}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <CountryCodeDropdown
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="flex-shrink-0"
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={handleChange}
                    className={`${inputClass} flex-1`}
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Total Guests {optionalLabel}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. 4"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Date {optionalLabel}
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Preferred Time {optionalLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    name="timeHour"
                    value={formData.timeHour}
                    onChange={handleChange}
                    aria-label="Hour"
                    className={`${inputClass} bg-white px-2`}
                  >
                    <option value="">Hour</option>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    name="timeMinute"
                    value={formData.timeMinute}
                    onChange={handleChange}
                    aria-label="Minutes"
                    className={`${inputClass} bg-white px-2`}
                  >
                    <option value="">Min</option>
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  <select
                    name="timeMeridiem"
                    value={formData.timeMeridiem}
                    onChange={handleChange}
                    aria-label="AM or PM"
                    className={`${inputClass} bg-white px-2`}
                  >
                    <option value="">AM/PM</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Special Requests {optionalLabel}
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Birthday celebration, anniversary, dietary preferences, window seating..."
              />
            </div>

            {message && (
              <motion.div
                className={`p-4 rounded-lg ${
                  message.includes('Thank you')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <CalendarCheck className="w-5 h-5 mr-2" />
              {loading ? 'Submitting...' : 'Reserve Table'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ReserveTable;
