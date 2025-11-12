'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Users, CreditCard, Clock, 
  CheckCircle, AlertCircle, Minus, Plus, Phone 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';

interface Room {
  id: string;
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
  gst: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  nights: number;
  available: boolean;
}

interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  id_type: string;
  id_number: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, room }) => {
  const { user, isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Step 1: Date and Guest Selection
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  
  // Step 2: Guest Details
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phone: '',
    id_type: 'aadhar',
    id_number: ''
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [holdToken, setHoldToken] = useState('');
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Step 3: Payment
  const [bookingReference, setBookingReference] = useState('');

  useEffect(() => {
    if (holdExpiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(holdExpiresAt).getTime();
        const remaining = Math.max(0, expiry - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          toast.error('Booking hold expired. Please start again.');
          handleClose();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [holdExpiresAt]);

  const handleClose = () => {
    setStep(1);
    setCheckInDate('');
    setCheckOutDate('');
    setGuests(1);
    setRooms(1);

    setPricing(null);
    setGuestDetails({
      name: '',
      email: '',
      phone: '',
      id_type: 'aadhar',
      id_number: ''
    });
    setCountryCode('+91');
    setPhoneNumber('');
    setSpecialRequests('');
    setHoldToken('');
    setHoldExpiresAt(null);
    setBookingReference('');
    onClose();
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculatePrice = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    console.log('Sending price check request:', {
      room_id: room.id,
      start_date: checkInDate,
      end_date: checkOutDate,
      guests: guests,
      promo_code: null
    });

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/price-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_id: room.id,
          start_date: checkInDate,
          end_date: checkOutDate,
          guests: guests,
          promo_code: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Price check error:', response.status, errorData);
        throw new Error(`Failed to calculate price: ${errorData.detail || 'Unknown error'}`);
      }

      const pricingData = await response.json();
      setPricing(pricingData);

      if (!pricingData.available) {
        toast.error('Room not available for selected dates');
        return;
      }

      // Check if user is authenticated before proceeding
      if (!isAuthenticated) {
        onClose(); // Close the booking modal
        openAuthModal('login'); // Open the header's auth modal
        return;
      }

      // Pre-fill guest details with user info
      if (user) {
        setGuestDetails({
          name: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          id_type: 'aadhar',
          id_number: ''
        });
      }

      setStep(2);
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  const createHold = async () => {
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone || !guestDetails.id_number) {
      toast.error('Please fill in all required guest details');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${API_URL}/api/bookings/hold`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          room_id: room.id,
          start_date: checkInDate,
          end_date: checkOutDate,
          guests: guests,
          guest_details: guestDetails,
          special_requests: specialRequests || null,
          promo_code: null,
          idempotency_key: idempotencyKey
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create booking hold');
      }

      const holdData = await response.json();
      setHoldToken(holdData.hold_token);
      setHoldExpiresAt(new Date(holdData.expires_at));
      setBookingReference(holdData.booking.booking_reference);
      setStep(3);
      
      toast.success('Booking hold created successfully!');
    } catch (error: any) {
      console.error('Error creating hold:', error);
      toast.error(error.message || 'Failed to create booking hold');
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!holdToken) {
      toast.error('No booking hold found');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          hold_token: holdToken,
          idempotency_key: holdToken // Using hold_token as idempotency_key
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to confirm booking');
      }

      const bookingData = await response.json();
      
      // Create payment session
      const paymentResponse = await fetch(`${API_URL}/api/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingData.id
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment session');
      }

      const paymentData = await paymentResponse.json();
      
      // Here you would integrate with Razorpay
      toast.success('Booking confirmed! Redirecting to payment...');
      
      // For now, just show success
      setTimeout(() => {
        handleClose();
        window.location.href = `/booking-confirmation/${bookingData.booking_reference}`;
      }, 2000);
      
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      toast.error(error.message || 'Failed to confirm booking');
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 9998 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-navy-900 bg-opacity-75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ zIndex: 9997 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-off-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{ zIndex: 9999 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted-beige">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-navy-900">
                  Book {room.title}
                </h2>
              </div>
              
              {holdExpiresAt && timeRemaining > 0 && (
                <div className="text-center">
                  <div className="text-sm text-charcoal-600">Hold expires in</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 text-charcoal-600 hover:text-navy-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Date and Guest Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Check-in Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Check-out Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={checkInDate || new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Number of Guests
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newGuests = Math.max(1, guests - 1);
                            setGuests(newGuests);
                            // Auto-adjust rooms based on guests
                            const requiredRooms = Math.ceil(newGuests / room.max_occupancy);
                            setRooms(Math.max(1, requiredRooms));
                          }}
                          className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="flex items-center space-x-2">
                          <Users size={18} className="text-charcoal-600" />
                          <span className="text-lg font-medium">{guests}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newGuests = guests + 1;
                            setGuests(newGuests);
                            // Auto-adjust rooms based on guests
                            const requiredRooms = Math.ceil(newGuests / room.max_occupancy);
                            setRooms(Math.max(1, requiredRooms));
                          }}
                          className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Number of Rooms
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newRooms = Math.max(1, rooms - 1);
                            setRooms(newRooms);
                            // Adjust guests if rooms can't accommodate current guest count
                            const maxGuestsForRooms = newRooms * room.max_occupancy;
                            if (guests > maxGuestsForRooms) {
                              setGuests(maxGuestsForRooms);
                            }
                          }}
                          className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium">{rooms}</span>
                          <span className="text-sm text-charcoal-600">Room{rooms > 1 ? 's' : ''}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          className="p-2 border border-soft-gray rounded-lg hover:bg-muted-beige transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">
                        Max {room.max_occupancy} guests per room
                      </div>
                    </div>
                  </div>



                  {pricing && (
                    <div className="bg-muted-beige p-4 rounded-lg">
                      <h4 className="font-semibold text-navy-900 mb-3">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{rooms} Room{rooms > 1 ? 's' : ''} ({pricing.nights} nights)</span>
                          <span>₹{pricing.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%)</span>
                          <span>₹{pricing.gst.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Charge</span>
                          <span>₹{pricing.service_charge.toLocaleString()}</span>
                        </div>
                        {pricing.discount_amount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{pricing.discount_amount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-soft-gray pt-2 flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>₹{pricing.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={calculatePrice}
                    disabled={loading || !checkInDate || !checkOutDate}
                    className="w-full btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Calculating...' : 'Check Availability & Price'}
                  </button>
                </div>
              )}

              {/* Step 2: Guest Details */}
              {step === 2 && pricing && (
                <div className="space-y-6">
                  <div className="bg-muted-beige p-4 rounded-lg">
                    <h4 className="font-semibold text-navy-900 mb-2">Booking Summary</h4>
                    <div className="text-sm space-y-1">
                      <div>Check-in: {new Date(checkInDate).toLocaleDateString()}</div>
                      <div>Check-out: {new Date(checkOutDate).toLocaleDateString()}</div>
                      <div>Guests: {guests} | Rooms: {rooms}</div>
                      <div className="font-semibold">Total: ₹{pricing.total_amount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestDetails.name}
                        onChange={(e) => setGuestDetails({...guestDetails, name: e.target.value})}
                        className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) => setGuestDetails({...guestDetails, email: e.target.value})}
                        className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="flex gap-2">
                        <CountryCodeDropdown
                          value={countryCode}
                          onChange={(newCode) => {
                            setCountryCode(newCode);
                            setGuestDetails({...guestDetails, phone: `${newCode}${phoneNumber}`});
                          }}
                          className="flex-shrink-0"
                        />
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-600" size={18} />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/\D/g, '');
                              setPhoneNumber(digitsOnly);
                              setGuestDetails({...guestDetails, phone: `${countryCode}${digitsOnly}`});
                            }}
                            onKeyDown={(e) => {
                              // Allow backspace, delete, tab, escape, enter, and arrow keys
                              if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                                  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                  (e.keyCode === 65 && e.ctrlKey) ||
                                  (e.keyCode === 67 && e.ctrlKey) ||
                                  (e.keyCode === 86 && e.ctrlKey) ||
                                  (e.keyCode === 88 && e.ctrlKey)) {
                                return;
                              }
                              // Ensure that it is a number and stop the keypress
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            placeholder="1234567890"
                            minLength={7}
                            maxLength={15}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-charcoal-600 mt-1">
                        Enter digits only (no spaces or special characters)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        ID Type *
                      </label>
                      <select
                        value={guestDetails.id_type}
                        onChange={(e) => setGuestDetails({...guestDetails, id_type: e.target.value})}
                        className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      >
                        <option value="aadhar">Aadhar Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      ID Number *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.id_number}
                      onChange={(e) => setGuestDetails({...guestDetails, id_number: e.target.value})}
                      className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-soft-gray rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 btn-outline-gold py-3"
                    >
                      Back
                    </button>
                    <button
                      onClick={createHold}
                      disabled={loading}
                      className="flex-1 btn-gold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Hold...' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-navy-900 mb-2">
                      Booking Hold Created!
                    </h3>
                    <p className="text-charcoal-600 mb-4">
                      Booking Reference: <span className="font-semibold">{bookingReference}</span>
                    </p>
                    {timeRemaining > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2 text-yellow-800">
                          <Clock size={20} />
                          <span>Complete payment within {formatTime(timeRemaining)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {pricing && (
                    <div className="bg-muted-beige p-4 rounded-lg">
                      <h4 className="font-semibold text-navy-900 mb-3">Final Amount</h4>
                      <div className="text-2xl font-bold text-center text-navy-900">
                        ₹{pricing.total_amount.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={confirmBooking}
                    disabled={loading}
                    className="w-full btn-gold py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <CreditCard size={20} />
                    <span>{loading ? 'Processing...' : 'Proceed to Payment'}</span>
                  </button>

                  <div className="text-center text-sm text-charcoal-600">
                    <p>Secure payment powered by Razorpay</p>
                    <p>Your booking will be confirmed after successful payment</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default BookingModal;