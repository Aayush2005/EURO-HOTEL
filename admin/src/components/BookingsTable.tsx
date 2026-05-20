'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircle, XCircle, Zap, AlertTriangle, ChevronDown, ChevronUp,
  Users, Phone, Mail, Calendar, BedDouble, Clock,
} from 'lucide-react';

export interface Booking {
  id: number;
  booking_reference: string;
  booking_status: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  total_guests: number;
  check_in: string;
  check_out: string;
  total_amount: number;
  special_requests: string | null;
  created_at: string;
  cancellation_requested_at: string | null;
  cancellation_reason: string | null;
  user_id: string | null;
  payment_status: string;
  order_id: string;
  user_full_name: string | null;
  user_email: string | null;
  total_rooms: number;
  allocated_rooms: number;
}

interface Props {
  bookings: Booking[];
  onRefresh: () => void;
}

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending:        'bg-amber-100 text-amber-700',
  confirmed:      'bg-emerald-100 text-emerald-700',
  checked_in:     'bg-blue-100 text-blue-700',
  checked_out:    'bg-purple-100 text-purple-700',
  cancelled:      'bg-red-100 text-red-600',
  payment_failed: 'bg-orange-100 text-orange-700',
  no_show:        'bg-slate-100 text-slate-600',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-600',
  initiated: 'bg-sky-50 text-sky-600',
  success:   'bg-emerald-50 text-emerald-600',
  failed:    'bg-red-50 text-red-500',
  expired:   'bg-slate-50 text-slate-500',
  cancelled: 'bg-slate-50 text-slate-500',
  refunded:  'bg-violet-50 text-violet-600',
};

function StatusBadge({ value, type }: { value: string; type: 'booking' | 'payment' }) {
  const styles = type === 'booking' ? BOOKING_STATUS_STYLES : PAYMENT_STATUS_STYLES;
  const cls = styles[value] ?? 'bg-slate-100 text-slate-500';
  return (
    <span className={`status-badge ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / 86400000);
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function fmtDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function BookingsTable({ bookings, onRefresh }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<{ id: number; msg: string; ok: boolean }[]>([]);

  const toast = useCallback((msg: string, ok = true) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, ok }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const setLoading = (key: string, val: boolean) =>
    setLoadingActions((prev) => ({ ...prev, [key]: val }));

  async function doAction(key: string, url: string, successMsg: string) {
    setLoading(key, true);
    try {
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast(successMsg);
        onRefresh();
      } else {
        toast(data.error ?? data.detail ?? 'Something went wrong', false);
      }
    } catch {
      toast('Network error', false);
    } finally {
      setLoading(key, false);
    }
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-charcoal-400">
        <BedDouble size={40} className="mb-3 opacity-30" />
        <p className="font-medium">No bookings found</p>
        <p className="text-sm mt-1">Try a different filter</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all
              ${t.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {t.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {t.msg}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              {['Booking', 'Guest', 'Stay', 'Amount', 'Status', 'Rooms', 'Cancellation', 'Actions']
                .map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => {
              const isExpanded = expanded.has(b.id);
              const nights = nightsBetween(b.check_in, b.check_out);
              const cancelKey = `cancel-${b.id}`;
              const rejectKey = `reject-${b.id}`;
              const allocKey = `alloc-${b.id}`;
              const hasCancelReq = !!b.cancellation_requested_at && b.booking_status !== 'cancelled';
              const fullyAllocated = b.allocated_rooms >= b.total_rooms;

              return (
                <React.Fragment key={b.id}>
                  <tr
                    className={`group hover:bg-slate-50/70 transition-colors cursor-pointer ${isExpanded ? 'bg-gold-50/30' : ''}`}
                    onClick={() => toggleExpand(b.id)}
                  >
                    {/* Booking ref */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-semibold text-navy-900 text-xs">
                        {b.booking_reference}
                      </div>
                      <div className="text-charcoal-400 text-xs mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {fmtDateTime(b.created_at)}
                      </div>
                    </td>

                    {/* Guest */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-charcoal-700 text-xs">{b.guest_name}</div>
                      <div className="text-charcoal-400 text-xs flex items-center gap-1 mt-0.5">
                        <Mail size={10} />
                        {b.guest_email}
                      </div>
                      <div className="text-charcoal-400 text-xs flex items-center gap-1 mt-0.5">
                        <Phone size={10} />
                        {b.guest_phone}
                      </div>
                      {b.user_full_name && (
                        <div className="text-xs mt-1">
                          <span className="bg-navy-900/10 text-navy-900 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit">
                            <Users size={9} /> {b.user_full_name}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Stay */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-charcoal-700 text-xs">
                        <Calendar size={12} className="text-gold-600" />
                        <span>{fmt(b.check_in)}</span>
                      </div>
                      <div className="text-charcoal-400 text-xs my-0.5 pl-4">↓</div>
                      <div className="flex items-center gap-1.5 text-charcoal-700 text-xs">
                        <Calendar size={12} className="text-charcoal-400" />
                        <span>{fmt(b.check_out)}</span>
                      </div>
                      <div className="text-charcoal-400 text-[10px] mt-1">
                        {nights} night{nights !== 1 ? 's' : ''} · {b.total_guests} guest{b.total_guests !== 1 ? 's' : ''}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-charcoal-700 text-sm">
                        <span className="text-gold-600">₹</span>{Number(b.total_amount).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge value={b.booking_status} type="booking" />
                        <StatusBadge value={b.payment_status} type="payment" />
                      </div>
                    </td>

                    {/* Rooms */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <BedDouble size={14} className={fullyAllocated ? 'text-emerald-500' : 'text-amber-500'} />
                        <span className={`text-xs font-semibold ${fullyAllocated ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {b.allocated_rooms}/{b.total_rooms}
                        </span>
                      </div>
                      <div className="text-charcoal-400 text-[10px] mt-0.5">
                        {fullyAllocated ? 'All allocated' : 'Needs allocation'}
                      </div>
                    </td>

                    {/* Cancellation */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {hasCancelReq ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={12} className="text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700">Cancel Requested</span>
                          </div>
                          {b.cancellation_reason && (
                            <p className="text-[10px] text-charcoal-500 max-w-32 line-clamp-2 italic">
                              "{b.cancellation_reason}"
                            </p>
                          )}
                          <div className="text-[10px] text-charcoal-400">
                            {fmtDateTime(b.cancellation_requested_at!)}
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            <button
                              className="btn-action bg-emerald-500 text-white hover:bg-emerald-600 text-[11px] px-2 py-1"
                              disabled={loadingActions[cancelKey]}
                              onClick={() => doAction(cancelKey, `/api/bookings/${b.id}/approve-cancellation`, 'Cancellation approved')}
                            >
                              <CheckCircle size={11} />
                              Approve
                            </button>
                            <button
                              className="btn-action bg-red-500 text-white hover:bg-red-600 text-[11px] px-2 py-1"
                              disabled={loadingActions[rejectKey]}
                              onClick={() => doAction(rejectKey, `/api/bookings/${b.id}/reject-cancellation`, 'Cancellation rejected')}
                            >
                              <XCircle size={11} />
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : b.booking_status === 'cancelled' ? (
                        <span className="text-xs text-red-400 font-medium">Cancelled</span>
                      ) : (
                        <span className="text-charcoal-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {b.booking_status === 'confirmed' && !fullyAllocated && (
                        <button
                          className="btn-action text-navy-900 text-[11px]"
                          style={{ background: 'linear-gradient(135deg, #C9A227, #D4B332)' }}
                          disabled={loadingActions[allocKey]}
                          onClick={() => doAction(allocKey, `/api/bookings/${b.id}/auto-allocate`, `Rooms allocated for ${b.booking_reference}`)}
                        >
                          <Zap size={11} />
                          {loadingActions[allocKey] ? 'Allocating…' : 'Auto-allocate'}
                        </button>
                      )}
                    </td>

                    {/* Expand toggle */}
                    <td className="pr-3 py-3.5">
                      <button className="text-charcoal-400 hover:text-charcoal-600 p-1 rounded">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr className="bg-gold-50/30">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {/* Special requests */}
                          <div>
                            <span className="font-semibold text-charcoal-500 uppercase tracking-wider text-[10px]">Special Requests</span>
                            <p className="mt-1 text-charcoal-600 italic">
                              {b.special_requests || 'None'}
                            </p>
                          </div>
                          {/* Order / payment info */}
                          <div>
                            <span className="font-semibold text-charcoal-500 uppercase tracking-wider text-[10px]">Payment Order</span>
                            <p className="mt-1 font-mono text-charcoal-600">{b.order_id}</p>
                            <p className="text-charcoal-400 mt-0.5">Booking ID: #{b.id}</p>
                            {b.user_id && (
                              <p className="text-charcoal-400 mt-0.5 font-mono text-[10px]">User: {b.user_id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
