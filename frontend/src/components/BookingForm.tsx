'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const BookingFormContent = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    roomType: 'deluxe'
  });

  // Handle room pre-selection from URL
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam && ['deluxe', 'royal', 'executive', 'presidential'].includes(roomParam)) {
      setFormData(prev => ({ ...prev, roomType: roomParam }));
    }
    
    // Scroll to booking form if requested
    const scrollParam = searchParams.get('scroll');
    if (scrollParam === 'booking') {
      setTimeout(() => {
        const bookingElement = document.getElementById('booking-form');
        if (bookingElement) {
          bookingElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage('');

    try {
      // Calculate total amount (simplified pricing)
      const roomPrices: { [key: string]: number } = {
        deluxe: 15000,
        royal: 25000,
        executive: 20000,
        presidential: 50000,
      };

      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = roomPrices[formData.roomType] * nights;

      // Log booking data for FastAPI integration
      console.log('Booking Data for FastAPI:', {
        roomType: formData.roomType,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests),
        totalAmount,
        nights
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(`Booking request submitted successfully! Total: ₹${totalAmount.toLocaleString()} for ${nights} night(s). We will contact you shortly.`);
      
      // Reset form
      setFormData({
        checkIn: '',
        checkOut: '',
        guests: '2',
        roomType: 'deluxe'
      });
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'An error occurred while processing your booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="booking-form" className="py-20 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Luxury Hotel Room"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 to-navy-900/70"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-sm text-gold-400 uppercase tracking-widest font-medium mb-4">
              RESERVE YOUR STAY
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-4">
              Book Your <span className="text-gold-400">Royal Experience</span>
            </h2>
            <p className="text-white/80 text-lg font-light max-w-2xl mx-auto">
              Experience luxury redefined in the heart of Hyderabad&apos;s heritage district
            </p>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            className="premium-card p-8 md:p-12 bg-white/95 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    required
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num.toString()}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Room Type
                  </label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                  >
                    <option value="deluxe">Heritage Deluxe Suite - ₹15,000/night</option>
                    <option value="royal">Royal Nizami Suite - ₹25,000/night</option>
                    <option value="executive">Executive Palace Suite - ₹20,000/night</option>
                    <option value="presidential">Presidential Suite - ₹50,000/night</option>
                  </select>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <motion.div
                  className={`p-4 rounded-lg ${
                    message.includes('successfully') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Processing...' : 'Reserve Now'}
              </motion.button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-gold-600 font-semibold">Free Cancellation</div>
                  <div className="text-sm text-charcoal-600">Up to 24 hours before check-in</div>
                </div>
                <div>
                  <div className="text-gold-600 font-semibold">Best Price Guarantee</div>
                  <div className="text-sm text-charcoal-600">We match any lower rate</div>
                </div>
                <div>
                  <div className="text-gold-600 font-semibold">24/7 Support</div>
                  <div className="text-sm text-charcoal-600">Dedicated concierge service</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BookingForm = () => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <BookingFormContent />
    </Suspense>
  );
};

export default BookingForm;