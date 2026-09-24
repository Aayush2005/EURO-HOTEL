CREATE TABLE IF NOT EXISTS hotel.table_reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    guests INT NOT NULL CHECK (guests > 0),
    reserve_date DATE NOT NULL,
    reserve_time TIME NOT NULL,
    special_requests TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'requested',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT table_reservations_status_check CHECK (status IN ('requested','confirmed','cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_table_reservations_date ON hotel.table_reservations(reserve_date);
CREATE INDEX IF NOT EXISTS idx_table_reservations_status ON hotel.table_reservations(status);
