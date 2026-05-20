CREATE TABLE IF NOT EXISTS hotel.bookings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NULL REFERENCES hotel.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    total_guests INT NOT NULL CHECK (total_guests > 0),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    booking_status VARCHAR(50) NOT NULL,
    subtotal_amount NUMERIC(10,2) NOT NULL CHECK (subtotal_amount >= 0),
    tax_amount NUMERIC(10,2) NOT NULL CHECK (tax_amount >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookings_status_check CHECK (booking_status IN ('pending','confirmed','checked_in','checked_out','cancelled','payment_failed','no_show')),
    CONSTRAINT bookings_date_check CHECK (check_out > check_in)
);

CREATE TABLE IF NOT EXISTS hotel.booking_rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES hotel.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE,
    room_id BIGINT NULL REFERENCES hotel.rooms(id) ON UPDATE CASCADE ON DELETE SET NULL,
    room_type_id BIGINT NOT NULL REFERENCES hotel.room_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    guests_count INT NOT NULL CHECK (guests_count > 0),
    price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
    total_nights INT NOT NULL CHECK (total_nights > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel.payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES hotel.bookings(id) ON UPDATE CASCADE ON DELETE CASCADE,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    transaction_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    gateway_response JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payments_status_check CHECK (payment_status IN ('pending','initiated','success','failed','cancelled','refunded','expired'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON hotel.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON hotel.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON hotel.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking_id ON hotel.booking_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_type_id ON hotel.booking_rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_id ON hotel.booking_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON hotel.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON hotel.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON hotel.payments(payment_status);
