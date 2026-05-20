'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Users, CreditCard,
  CheckCircle, Minus, Plus, Phone, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

interface Room {
  room_type_id: number;
  title: string;
  base_price: number;
  max_occupancy: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

interface PricingBreakdown {
  subtotal: number;
  tax: number;
  total_amount: number;
  nights: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, room }) => {
  const { user, authenticatedFetch } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxDate = React.useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Step 1
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Step 2
  const [bookForSelf, setBookForSelf] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3
  const [bookingReference, setBookingReference] = useState('');
  const [holdToken, setHoldToken] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Countdown timer for hold expiry
  useEffect(() => {
    if (!holdExpiresAt) { setTimeLeft(null); return; }
    const tick = () => {
      const ms = holdExpiresAt.getTime() - Date.now();
      setTimeLeft(ms > 0 ? ms : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  // Fetch live availability whenever dates change
  useEffect(() => {
    if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
      setAvailableRooms(null);
      return;
    }
    let cancelled = false;
    setAvailabilityLoading(true);
    fetch(`${API_URL}/bookings/availability/${room.room_type_id}?check_in=${checkInDate}&check_out=${checkOutDate}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const av = typeof data.available === 'number' ? data.available : null;
        setAvailableRooms(av);
        if (av !== null && rooms > av) setRooms(Math.max(1, av));
      })
      .catch(() => { if (!cancelled) setAvailableRooms(null); })
      .finally(() => { if (!cancelled) setAvailabilityLoading(false); });
    return () => { cancelled = true; };
  }, [checkInDate, checkOutDate, room.room_type_id]);

  // When "book for self" is toggled, sync user profile data
  useEffect(() => {
    if (bookForSelf && user) {
      setGuestName(user.full_name || '');
      setGuestEmail(user.email || '');
      if (user.phone) {
        const digits = user.phone.replace(/\D/g, '');
        setPhoneNumber(digits.length > 10 ? digits.slice(-10) : digits);
      } else {
        setPhoneNumber('');
      }
    } else if (!bookForSelf) {
      setGuestName('');
      setGuestEmail('');
      setPhoneNumber('');
    }
  }, [bookForSelf, user]);

  const handleClose = () => {
    setStep(1);
    setCheckInDate('');
    setCheckOutDate('');
    setGuests(1);
    setRooms(1);
    setPricing(null);
    setAvailableRooms(null);
    setAvailabilityLoading(false);
    setBookForSelf(true);
    setGuestName('');
    setGuestEmail('');
    setCountryCode('+91');
    setPhoneNumber('');
    setSpecialRequests('');
    setHoldToken('');
    setBookingReference('');
    setPaymentUrl('');
    setHoldExpiresAt(null);
    setTimeLeft(null);
    setConfirmed(false);
    onClose();
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const TAX_RATE = 0.05;

  const calculatePrice = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    const nights = Math.max(1, Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000
    ));
    const subtotal = room.base_price * rooms * nights;
    const tax = subtotal * TAX_RATE;
    setPricing({ subtotal, tax, total_amount: subtotal + tax, nights });
    setStep(2);
  };

  const fullPhone = `${countryCode}${phoneNumber}`;

  const createHold = async () => {
    if (!guestName.trim()) { toast.error('Guest name is required'); return; }
    if (!guestEmail.trim()) { toast.error('Guest email is required'); return; }
    if (!phoneNumber.trim()) { toast.error('Phone number is required'); return; }

    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await authenticatedFetch('/bookings/create', {
        method: 'POST',
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: fullPhone,
          total_guests: guests,
          check_in: checkInDate,
          check_out: checkOutDate,
          special_requests: specialRequests.trim() || null,
          rooms: [{ room_type_id: room.room_type_id, quantity: rooms, guests_count: guests }],
        }),
      });

      if (!response.ok) {
        let detail = 'Booking failed';
        try {
          const body = await response.json();
          if (typeof body.detail === 'string') detail = body.detail;
          else if (typeof body.message === 'string') detail = body.message;
        } catch {}
        throw new Error(detail);
      }

      const data = await response.json();
      setHoldToken(data.payment.order_id);
      setBookingReference(data.booking_reference);
      setPaymentUrl(data.payment.payment_links?.web || '');
      if (data.hold_expires_at) setHoldExpiresAt(new Date(data.hold_expires_at));
      setStep(3);
      toast.success('Booking created! Proceed to payment.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect payment: poll every 5s + listen for BroadcastChannel from the payment tab
  useEffect(() => {
    if (step !== 3 || !holdToken) return;

    let active = true;

    const applyStatus = (paymentStatus: string) => {
      if (!active) return;
      if (paymentStatus === 'success') {
        active = false;
        setConfirmed(true);
      } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
        active = false;
        toast.error(`Payment ${paymentStatus}. Please try again or contact support.`);
      }
    };

    // Instant notification when the payment tab finishes
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('euro_hotel_payment') : null;
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data?.order_id === holdToken) applyStatus(e.data.payment_status);
      };
    }

    const poll = async () => {
      if (!active) return;
      try {
        const res = await authenticatedFetch(`/payments/status/${holdToken}`);
        if (!res.ok) return;
        const data = await res.json();
        applyStatus(data.payment_status);
      } catch {}
    };

    const id = setInterval(poll, 5000);

    return () => {
      active = false;
      clearInterval(id);
      channel?.close();
    };
  }, [step, holdToken]); // authenticatedFetch is stable from context

  const openPaymentPage = () => {
    if (!paymentUrl) {
      toast.error('Payment link not available. Please contact support.');
      return;
    }
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  const verifyPayment = async () => {
    if (!holdToken) { toast.error('No payment order found'); return; }
    setLoading(true);
    try {
      const res = await authenticatedFetch(`/payments/status/${holdToken}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Status check failed' }));
        throw new Error(err.detail || 'Status check failed');
      }
      const data = await res.json();
      if (data.payment_status === 'success') {
        setConfirmed(true);
        return;
      }
      if (data.payment_status === 'failed' || data.payment_status === 'expired') {
        toast.error(`Payment ${data.payment_status}. Please try again or contact support.`);
        return;
      }
      toast.error('Payment not yet completed. Please pay on the gateway first.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-navy-900 bg-opacity-75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-off-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{ zIndex: 9999 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-navy-900">
                  Book {room.title}
                </h2>
                <div className="flex gap-6 mt-2">
                  {['Dates', 'Guest Details', 'Payment'].map((label, i) => (
                    <span key={label} className={`text-xs font-medium ${step === i + 1 ? 'text-gold-600' : 'text-charcoal-400'}`}>
                      {i + 1}. {label}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">

              {/* ── Step 1: Dates & Rooms ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Check-in Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          max={maxDate}
                          className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Check-out Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={checkInDate || new Date().toISOString().split('T')[0]}
                          max={maxDate}
                          className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Guests</label>
                      <div className="flex items-center space-x-4">
                        <button type="button" onClick={() => { const g = Math.max(1, guests - 1); setGuests(g); setRooms(Math.max(1, Math.ceil(g / room.max_occupancy))); }} className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"><Minus size={16} /></button>
                        <div className="flex items-center space-x-2"><Users size={18} className="text-charcoal-600" /><span className="text-lg font-medium">{guests}</span></div>
                        <button type="button" onClick={() => { const g = guests + 1; setGuests(g); setRooms(Math.max(rooms, Math.ceil(g / room.max_occupancy))); }} className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Rooms</label>
                      <div className="flex items-center space-x-4">
                        <button type="button" onClick={() => { const r = Math.max(1, rooms - 1); setRooms(r); if (guests > r * room.max_occupancy) setGuests(r * room.max_occupancy); }} className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"><Minus size={16} /></button>
                        <span className="text-lg font-medium">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          disabled={availableRooms !== null && rooms >= availableRooms}
                          className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        ><Plus size={16} /></button>
                      </div>
                      {availabilityLoading ? (
                        <p className="text-xs text-charcoal-400 mt-1">Checking availability…</p>
                      ) : availableRooms === null ? (
                        <p className="text-xs text-charcoal-500 mt-1">Max {room.max_occupancy} guests/room</p>
                      ) : availableRooms === 0 ? (
                        <p className="text-xs text-red-500 font-medium mt-1">No rooms available for these dates</p>
                      ) : (
                        <p className="text-xs text-green-700 font-medium mt-1">{availableRooms} room{availableRooms !== 1 ? 's' : ''} available</p>
                      )}
                    </div>
                  </div>

                  {checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate) && (
                    <div className="bg-muted-beige p-4 rounded-lg">
                      <h4 className="font-semibold text-navy-900 mb-3">Estimated Price</h4>
                      {(() => {
                        const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000);
                        const subtotal = room.base_price * rooms * nights;
                        const tax = subtotal * TAX_RATE;
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span>{rooms} room{rooms > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}</span><span>₹{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-charcoal-600"><span>GST (5%)</span><span>₹{tax.toLocaleString()}</span></div>
                            <div className="border-t border-soft-gray pt-2 flex justify-between font-semibold text-lg"><span>Total</span><span>₹{(subtotal + tax).toLocaleString()}</span></div>
                            <p className="text-xs text-charcoal-500">Final amount confirmed at booking</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button
                    onClick={calculatePrice}
                    disabled={!checkInDate || !checkOutDate || availableRooms === 0}
                    className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Guest Details
                  </button>
                </div>
              )}

              {/* ── Step 2: Guest Details ── */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Summary */}
                  <div className="bg-muted-beige p-4 rounded-lg text-sm space-y-1">
                    <div className="font-semibold text-navy-900 mb-1">Booking Summary</div>
                    <div className="flex justify-between"><span>Check-in</span><span>{new Date(checkInDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                    <div className="flex justify-between"><span>Check-out</span><span>{new Date(checkOutDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                    <div className="flex justify-between"><span>{rooms} room{rooms > 1 ? 's' : ''}, {guests} guest{guests > 1 ? 's' : ''}</span><span className="font-semibold">₹{pricing ? (pricing.total_amount).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}</span></div>
                  </div>

                  {/* Book for self toggle */}
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none ${bookForSelf ? 'border-gold-400 bg-gold-50' : 'border-soft-gray hover:bg-muted-beige'}`}>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${bookForSelf ? 'bg-gold-500' : 'bg-soft-gray'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${bookForSelf ? 'translate-x-5' : 'translate-x-1'}`} />
                      <input type="checkbox" className="sr-only" checked={bookForSelf} onChange={(e) => setBookForSelf(e.target.checked)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck size={18} className="text-gold-600" />
                      <span className="font-medium text-navy-900">Book for myself</span>
                    </div>
                    {bookForSelf && user && (
                      <span className="text-xs text-charcoal-500 ml-auto">{user.full_name || user.email}</span>
                    )}
                  </label>

                  {bookForSelf ? (
                    /* Self-booking: show pre-filled read-only fields + phone if missing */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gold-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={guestName}
                            disabled
                            className="w-full px-4 py-3 border border-gold-400 rounded-lg bg-gold-50 text-navy-900 font-medium cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gold-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={guestEmail}
                            disabled
                            className="w-full px-4 py-3 border border-gold-400 rounded-lg bg-gold-50 text-navy-900 font-medium cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gold-700 mb-2">
                          Phone Number {!user?.phone && <span className="text-red-500">*</span>}
                        </label>
                        {user?.phone ? (
                          <input
                            type="text"
                            value={phoneNumber}
                            disabled
                            className="w-full px-4 py-3 border border-gold-400 rounded-lg bg-gold-50 text-navy-900 font-medium cursor-not-allowed"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <CountryCodeDropdown value={countryCode} onChange={setCountryCode} className="flex-shrink-0" />
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                                placeholder="1234567890"
                                maxLength={10}
                              />
                            </div>
                          </div>
                        )}
                        {!user?.phone && (
                          <p className="text-xs text-charcoal-500 mt-1">Not set in your profile — enter it here</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Guest booking: editable fields */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2">Guest Full Name *</label>
                          <input
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2">Guest Email *</label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">Guest Phone *</label>
                        <div className="flex gap-2">
                          <CountryCodeDropdown value={countryCode} onChange={setCountryCode} className="flex-shrink-0" />
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-600" size={18} />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                              placeholder="1234567890"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Special Requests <span className="text-charcoal-400 font-normal">(optional)</span></label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Any preferences or requests..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 btn-outline-gold py-3">Back</button>
                    <button onClick={createHold} disabled={loading} className="flex-1 btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Creating booking...' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Payment / Confirmed ── */}
              {step === 3 && (
                confirmed ? (
                  /* ── Confirmed view ── */
                  <div className="flex flex-col items-center text-center py-6 space-y-5">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="text-green-500" size={56} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-semibold text-navy-900 mb-1">Booking Confirmed!</h3>
                      <p className="text-charcoal-600 text-sm">
                        Reference: <span className="font-mono font-semibold text-navy-900">{bookingReference}</span>
                      </p>
                    </div>
                    {pricing && (
                      <p className="text-charcoal-600 text-sm">
                        ₹{pricing.total_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} paid successfully
                      </p>
                    )}
                    <div className="flex gap-3 w-full pt-2">
                      <button onClick={handleClose} className="flex-1 btn-outline-gold py-3">Close</button>
                      <a href="/profile" className="flex-1 btn-gold py-3 text-center">View Bookings</a>
                    </div>
                  </div>
                ) : (
                  /* ── Awaiting payment view ── */
                  <div className="space-y-5">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-navy-900 mb-1">Complete Your Payment</h3>
                      <p className="text-charcoal-600 text-sm">
                        Ref: <span className="font-semibold text-navy-900">{bookingReference}</span>
                      </p>
                    </div>

                    {pricing && (
                      <div className="bg-muted-beige p-4 rounded-lg text-center">
                        <div className="text-sm text-charcoal-600 mb-1">Amount to pay</div>
                        <div className="text-3xl font-bold text-navy-900">
                          ₹{pricing.total_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Includes 5% GST</div>
                      </div>
                    )}

                    <button
                      onClick={openPaymentPage}
                      disabled={!paymentUrl}
                      className="w-full btn-gold py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard size={20} />
                      Proceed to Payment
                    </button>

                    <button
                      onClick={verifyPayment}
                      disabled={loading}
                      className="w-full btn-outline-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying...' : "I've paid — Check Status"}
                    </button>

                    <p className="text-center text-xs text-charcoal-500">
                      Secure payment via HDFC SmartGateway.{' '}
                      {timeLeft !== null && timeLeft > 0
                        ? <>Held for <span className="font-semibold text-gold-600">{formatTime(timeLeft)}</span>.</>
                        : timeLeft === 0
                        ? <span className="text-red-500 font-semibold">Hold expired — room may no longer be available.</span>
                        : 'Your room is held for 30 minutes.'}
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
