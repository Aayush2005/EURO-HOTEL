'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type VerifyState = 'verifying' | 'success' | 'failed' | 'pending' | 'error';

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <Loader2 className="text-gold-600 animate-spin" size={48} />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const { authenticatedFetch, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<VerifyState>('verifying');
  const [bookingStatus, setBookingStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const orderId = searchParams.get('order_id');
  const signature = searchParams.get('signature');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (authLoading) return;
    if (errorParam || !orderId) {
      setState('error');
      setErrorMessage(
        errorParam === 'missing_order' ? 'No order ID received from the payment gateway.' :
        errorParam === 'parse_failed' ? 'Could not read the payment response. Please contact support.' :
        'No order ID found in the URL.'
      );
      return;
    }

    const verify = async () => {
      try {
        const params = signature ? `?signature=${encodeURIComponent(signature)}` : '';
        const response = await authenticatedFetch(`/payments/status/${orderId}${params}`);

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: 'Verification failed' }));
          throw new Error(err.detail || 'Verification failed');
        }

        const data = await response.json();
        setBookingStatus(data.booking_status);

        // Notify the original booking tab so it auto-confirms without manual click
        if (data.payment_status === 'success' || data.payment_status === 'failed' || data.payment_status === 'expired') {
          try {
            const ch = new BroadcastChannel('euro_hotel_payment');
            ch.postMessage({ order_id: orderId, payment_status: data.payment_status });
            ch.close();
          } catch {}
        }

        // Close this tab automatically on success — the booking modal already shows confirmation
        if (data.payment_status === 'success') {
          window.close();
          // If window.close() is blocked (tab wasn't opened via script), fall through to show UI
        }

        if (data.payment_status === 'success') {
          setState('success');
        } else if (data.payment_status === 'failed' || data.payment_status === 'expired') {
          setState('failed');
        } else {
          setState('pending');
        }
      } catch (err: any) {
        setState('error');
        setErrorMessage(err.message || 'Could not verify payment. Please contact support.');
      }
    };

    verify();
  }, [orderId, authLoading, retryCount]);

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-6">
      <div className="premium-card p-10 max-w-md w-full text-center">

        {state === 'verifying' && (
          <>
            <Loader2 className="mx-auto text-gold-600 mb-4 animate-spin" size={56} />
            <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Verifying Payment</h1>
            <p className="text-charcoal-600">Please wait while we confirm your payment with HDFC…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-600 mb-4" size={56} />
            <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Payment Confirmed!</h1>
            <p className="text-charcoal-500 text-sm mb-6">You can close this tab and return to your booking.</p>
            <button onClick={() => window.close()} className="btn-gold px-8 py-3 inline-block">
              Close Tab
            </button>
          </>
        )}

        {state === 'failed' && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={56} />
            <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Payment Failed</h1>
            <p className="text-charcoal-600 mb-6">
              Your payment could not be processed. No amount has been charged. Please try booking again or contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/rooms" className="btn-outline-gold px-6 py-3 inline-block">Browse Rooms</Link>
              <Link href="/contact" className="btn-gold px-6 py-3 inline-block">Contact Us</Link>
            </div>
          </>
        )}

        {state === 'pending' && (
          <>
            <Clock className="mx-auto text-yellow-500 mb-4" size={56} />
            <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Payment Pending</h1>
            <p className="text-charcoal-600 mb-4">
              Your payment is still being processed by the bank. This usually resolves within a few minutes.
            </p>
            <p className="text-charcoal-500 text-sm mb-6">
              Order ID: <span className="font-mono font-semibold text-navy-900">{orderId}</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setState('verifying'); setRetryCount(c => c + 1); }}
                className="btn-gold px-6 py-3"
              >
                Check Again
              </button>
              <Link href="/profile" className="btn-outline-gold px-6 py-3 inline-block">My Profile</Link>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle className="mx-auto text-red-400 mb-4" size={56} />
            <h1 className="text-2xl font-serif font-semibold text-navy-900 mb-2">Something Went Wrong</h1>
            <p className="text-charcoal-600 mb-2">{errorMessage}</p>
            {orderId && (
              <p className="text-charcoal-500 text-sm mb-6">
                Order ID: <span className="font-mono font-semibold text-navy-900">{orderId}</span>
              </p>
            )}
            <Link href="/contact" className="btn-gold px-8 py-3 inline-block">Contact Support</Link>
          </>
        )}

        <p className="text-xs text-charcoal-400 mt-8">Powered by HDFC SmartGateway</p>
      </div>
    </div>
  );
}
