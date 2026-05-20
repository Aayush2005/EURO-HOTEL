'use client';

import { useState, useCallback, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import BookingsTable, { Booking } from '@/components/BookingsTable';
import { RefreshCw, BedDouble, CheckCircle2, Clock, AlertTriangle, TrendingUp, CalendarRange, X } from 'lucide-react';

const FILTERS = [
  { key: 'all',                label: 'All' },
  { key: 'pending',            label: 'Pending' },
  { key: 'confirmed',          label: 'Confirmed' },
  { key: 'cancellation_req',   label: 'Cancel Requests' },
  { key: 'cancelled',          label: 'Cancelled' },
];

interface Props {
  initialBookings: Booking[];
}

export default function DashboardClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const refresh = useCallback(async (filter = activeFilter) => {
    setLoading(true);
    try {
      const params = filter !== 'all' && filter !== 'cancellation_req'
        ? `?status=${filter}`
        : '';
      const res = await fetch(`/api/bookings${params}`, { cache: 'no-store' });
      if (res.ok) {
        let data: Booking[] = await res.json();
        if (filter === 'cancellation_req') {
          data = data.filter((b) => b.cancellation_requested_at && b.booking_status !== 'cancelled');
        }
        setBookings(data);
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  async function handleFilterChange(key: string) {
    setActiveFilter(key);
    setLoading(true);
    try {
      const params = key !== 'all' && key !== 'cancellation_req' ? `?status=${key}` : '';
      const res = await fetch(`/api/bookings${params}`, { cache: 'no-store' });
      if (res.ok) {
        let data: Booking[] = await res.json();
        if (key === 'cancellation_req') {
          data = data.filter((b) => b.cancellation_requested_at && b.booking_status !== 'cancelled');
        }
        setBookings(data);
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  // Apply date filter on top of status filter
  const filteredBookings = useMemo(() => {
    if (!dateFrom && !dateTo) return bookings;
    return bookings.filter((b) => {
      const checkIn = b.check_in.slice(0, 10); // 'YYYY-MM-DD'
      if (dateFrom && checkIn < dateFrom) return false;
      if (dateTo && checkIn > dateTo) return false;
      return true;
    });
  }, [bookings, dateFrom, dateTo]);

  const hasDateFilter = dateFrom || dateTo;

  function clearDates() {
    setDateFrom('');
    setDateTo('');
  }

  // Stats from the date-filtered set
  const total        = filteredBookings.length;
  const confirmed    = filteredBookings.filter((b) => b.booking_status === 'confirmed').length;
  const cancelReqs   = filteredBookings.filter((b) => b.cancellation_requested_at && b.booking_status !== 'cancelled').length;
  const totalRevenue = filteredBookings
    .filter((b) => ['confirmed', 'checked_in', 'checked_out'].includes(b.booking_status))
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold text-navy-900">Bookings</h1>
            <p className="text-charcoal-400 text-xs mt-0.5">
              Last updated · {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<BedDouble size={20} />}
              label="Total Bookings"
              value={total}
              color="#0B1D3A"
              bg="#EEF2FF"
            />
            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Confirmed"
              value={confirmed}
              color="#059669"
              bg="#ECFDF5"
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              label="Cancel Requests"
              value={cancelReqs}
              color="#D97706"
              bg="#FFFBEB"
              pulse={cancelReqs > 0}
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Revenue"
              value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
              color="#A6841F"
              bg="#FDF8EC"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === f.key
                    ? 'text-navy-900 shadow-sm'
                    : 'text-charcoal-400 hover:text-charcoal-600 hover:bg-slate-50'
                }`}
                style={activeFilter === f.key ? { background: 'linear-gradient(135deg, #C9A227, #D4B332)' } : {}}
              >
                {f.label}
                {f.key === 'cancellation_req' && cancelReqs > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cancelReqs}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-charcoal-400" />
                <span className="text-sm font-medium text-charcoal-600">
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                  {hasDateFilter && bookings.length !== filteredBookings.length && (
                    <span className="text-charcoal-400"> of {bookings.length}</span>
                  )}
                </span>
              </div>

              {/* Date filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-charcoal-400">
                  <CalendarRange size={14} />
                  <span className="text-xs font-medium">Check-in</span>
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-charcoal-700 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                />
                <span className="text-charcoal-400 text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-charcoal-700 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
                />
                {hasDateFilter && (
                  <button
                    onClick={clearDates}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-charcoal-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-xs text-charcoal-400">
                  <RefreshCw size={12} className="animate-spin" />
                  Loading…
                </div>
              )}
            </div>

            <div className={`transition-opacity ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <BookingsTable bookings={filteredBookings} onRefresh={() => refresh()} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon, label, value, color, bg, pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  pulse?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative`}
        style={{ background: bg, color }}>
        {icon}
        {pulse && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
        )}
      </div>
      <div>
        <div className="text-xs text-charcoal-400 font-medium">{label}</div>
        <div className="text-xl font-bold mt-0.5" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}
