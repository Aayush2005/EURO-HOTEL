ALTER TABLE hotel.bookings
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason       TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_cancellation_requested
  ON hotel.bookings (cancellation_requested_at)
  WHERE cancellation_requested_at IS NOT NULL;
