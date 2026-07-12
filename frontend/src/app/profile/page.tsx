'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Edit,
  BedDouble, XCircle, Clock, Loader2, AlertCircle, Ban, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SolidHeader from '@/components/SolidHeader';
import Footer from '@/components/Footer';
import ProfileModal from '@/components/auth/ProfileModal';

interface BookingSummary {
  id: number;
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  created_at: string;
  cancellation_requested_at: string | null;
}

const BOOKING_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending:        { label: 'Pending',        cls: 'bg-yellow-100 text-yellow-800' },
  confirmed:      { label: 'Confirmed',      cls: 'bg-green-100 text-green-800' },
  checked_in:     { label: 'Checked In',     cls: 'bg-blue-100 text-blue-800' },
  checked_out:    { label: 'Checked Out',    cls: 'bg-gray-100 text-gray-700' },
  cancelled:      { label: 'Cancelled',      cls: 'bg-gray-100 text-gray-500' },
  payment_failed: { label: 'Payment Failed', cls: 'bg-red-100 text-red-700' },
  no_show:        { label: 'No Show',        cls: 'bg-red-100 text-red-700' },
};

const PAYMENT_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Awaiting Payment', cls: 'bg-yellow-50 text-yellow-700' },
  initiated: { label: 'Processing',       cls: 'bg-blue-50 text-blue-700' },
  success:   { label: 'Paid',             cls: 'bg-green-50 text-green-700' },
  failed:    { label: 'Failed',           cls: 'bg-red-50 text-red-700' },
  expired:   { label: 'Expired',          cls: 'bg-gray-50 text-gray-600' },
  cancelled: { label: 'Cancelled',        cls: 'bg-gray-50 text-gray-600' },
};

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function nights(checkIn: string, checkOut: string) {
  return Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
  );
}

export default function ProfilePage() {
  const { user, isLoading, authenticatedFetch } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadBookings = async () => {
    try {
      const res = await authenticatedFetch('/bookings/me');
      if (!res.ok) throw new Error('Failed to load bookings');
      setBookings(await res.json());
    } catch (e: any) {
      setBookingsError(e.message || 'Could not load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading || !user) return;
    loadBookings();
  }, [isLoading, user]);

  const requestCancellation = async (bookingId: number) => {
    setCancelLoading(true);
    try {
      const res = await authenticatedFetch(`/bookings/${bookingId}/cancel-request`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason.trim() || null }),
      });
      if (!res.ok) {
        let detail = 'Failed to request cancellation';
        try { const b = await res.json(); if (typeof b.detail === 'string') detail = b.detail; } catch {}
        throw new Error(detail);
      }
      const data = await res.json();
      toast.success(data.status === 'cancelled' ? 'Booking cancelled.' : 'Cancellation request submitted.');
      setCancellingId(null);
      setCancelReason('');
      await loadBookings();
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4" />
          <p className="text-charcoal-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <SolidHeader />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Page title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-navy-900 mb-4">My Profile</h1>
              <p className="text-charcoal-600">Manage your account and view reservations</p>
            </div>

            {/* Profile Card */}
            <motion.div
              className="premium-card p-8 mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-semibold text-navy-900">Account Information</h2>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="btn-outline-gold flex items-center space-x-2 px-4 py-2"
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600/10 rounded-full flex items-center justify-center">
                    <Mail className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Email</p>
                    <p className="text-lg font-medium text-navy-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600/10 rounded-full flex items-center justify-center">
                    <User className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Full Name</p>
                    <p className="text-lg font-medium text-navy-900">{user?.full_name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gold-600/10 rounded-full flex items-center justify-center">
                    <Calendar className="text-gold-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-600">Member Since</p>
                    <p className="text-lg font-medium text-navy-900">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Bookings Section */}
            <motion.div
              id="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-serif font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <BedDouble size={24} className="text-gold-600" />
                My Bookings
              </h2>

              {bookingsLoading && (
                <div className="premium-card p-10 flex flex-col items-center gap-3 text-charcoal-600">
                  <Loader2 className="animate-spin text-gold-600" size={32} />
                  <span>Loading your bookings…</span>
                </div>
              )}

              {!bookingsLoading && bookingsError && (
                <div className="premium-card p-8 flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <span>{bookingsError}</span>
                </div>
              )}

              {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                <div className="premium-card p-10 text-center text-charcoal-500">
                  <BedDouble size={40} className="mx-auto mb-3 text-charcoal-300" />
                  <p className="text-lg font-medium text-navy-900 mb-1">No bookings yet</p>
                  <p className="text-sm">Your reservations will appear here once you book a room.</p>
                </div>
              )}

              {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                <div className="space-y-4">
                  {bookings.map((b) => {
                    const bStyle = BOOKING_STATUS_STYLES[b.booking_status] ?? { label: b.booking_status, cls: 'bg-gray-100 text-gray-700' };
                    const pStyle = PAYMENT_STATUS_STYLES[b.payment_status] ?? { label: b.payment_status, cls: 'bg-gray-100 text-gray-700' };
                    const n = nights(b.check_in, b.check_out);
                    const cancelRequested = !!b.cancellation_requested_at && b.booking_status !== 'cancelled';
                    const cancellable = ['confirmed', 'pending'].includes(b.booking_status) && !cancelRequested;
                    const isExpanding = cancellingId === b.id;

                    return (
                      <div key={b.id} className="premium-card p-6">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <p className="text-xs text-charcoal-500 mb-1">Booking Reference</p>
                            <p className="font-mono font-semibold text-navy-900 text-lg">{b.booking_reference}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bStyle.cls}`}>{bStyle.label}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pStyle.cls}`}>{pStyle.label}</span>
                            {cancelRequested && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                                <Clock size={11} /> Cancellation Requested
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Date grid */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-charcoal-500 mb-0.5">Check-in</p>
                            <p className="font-medium text-navy-900">{formatDate(b.check_in)}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500 mb-0.5">Check-out</p>
                            <p className="font-medium text-navy-900">{formatDate(b.check_out)}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500 mb-0.5">Duration</p>
                            <p className="font-medium text-navy-900">{n} night{n !== 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500 mb-0.5">Total</p>
                            <p className="font-semibold text-navy-900">
                              ₹{Number(b.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs text-charcoal-400">
                            Booked on {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {cancellable && (
                            <button
                              onClick={() => {
                                setCancellingId(isExpanding ? null : b.id);
                                setCancelReason('');
                              }}
                              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                              <Ban size={13} />
                              Request Cancellation
                              {isExpanding ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>

                        {/* Inline cancellation form */}
                        {isExpanding && (
                          <div className="mt-4 border-t border-soft-gray pt-4 space-y-3">
                            <p className="text-sm text-charcoal-700 font-medium">
                              {b.booking_status === 'pending'
                                ? 'This unpaid booking will be cancelled immediately.'
                                : 'Your request will be reviewed by our team.'}
                            </p>
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              rows={2}
                              placeholder="Reason for cancellation (optional)"
                              className="w-full px-3 py-2 text-sm border border-soft-gray rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => { setCancellingId(null); setCancelReason(''); }}
                                className="px-4 py-2 text-sm text-charcoal-600 hover:text-navy-900 transition-colors"
                              >
                                Nevermind
                              </button>
                              <button
                                onClick={() => requestCancellation(b.id)}
                                disabled={cancelLoading}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                              >
                                {cancelLoading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
                                {b.booking_status === 'pending' ? 'Cancel Booking' : 'Submit Request'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
