'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface RoomOption {
  room_type: string;
  room_base_price: number;
}

const BookingFormContent = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState<RoomOption[]>([]);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    roomType: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/rooms/`,
          { headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' } }
        );
        if (res.ok) {
          const data: RoomOption[] = await res.json();
          setRooms(data);
          setFormData(prev => ({ ...prev, roomType: prev.roomType || data[0]?.room_type || '' }));
        }
      } catch {
        // silently fail — form still works without room list
      }
    };
    fetchRooms();
  }, []);

  // Handle room pre-selection and scroll from URL
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) setFormData(prev => ({ ...prev, roomType: roomParam }));

    const scrollParam = searchParams.get('scroll');
    if (scrollParam === 'booking') {
      setTimeout(() => {
        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const params = new URLSearchParams({
        start_date: formData.checkIn,
        end_date: formData.checkOut,
        guests: formData.guests,
        room_type: formData.roomType,
      });

      setMessage('Redirecting to available rooms...');
      setTimeout(() => { window.location.href = `/rooms?${params.toString()}`; }, 800);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'An error occurred.');
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
          src="https://ik.imagekit.io/ufqbqa4l9/Euro%20Hotels%20Interiors-cdn/Euro%20Hotels%20-5.jpg?updatedAt=1777049081263"
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
              Book Your <span className="text-gold-400">Perfect Stay</span>
            </h2>
            <p className="text-white/80 text-lg font-light max-w-2xl mx-auto">
              Experience exceptional comfort and personalized service in the heart of Hyderabad
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
                    disabled={rooms.length === 0}
                  >
                    {rooms.length === 0 ? (
                      <option>Loading rooms...</option>
                    ) : (
                      rooms.map(r => (
                        <option key={r.room_type} value={r.room_type}>
                          {r.room_type} — ₹{r.room_base_price.toLocaleString()}/night
                        </option>
                      ))
                    )}
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
                  <div className="text-sm text-charcoal-600">Up to 48 hours before check-in</div>
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