ALTER TABLE hotel.bookings
    ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ;

-- Partial index — only pending bookings have an active hold
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expires
    ON hotel.bookings(hold_expires_at)
    WHERE booking_status = 'pending';
