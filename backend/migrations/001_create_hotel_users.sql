CREATE SCHEMA IF NOT EXISTS hotel;

CREATE TABLE IF NOT EXISTS hotel.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    CONSTRAINT hotel_users_role_check
        CHECK (role IN ('user', 'admin', 'manager', 'receptionist'))
);

CREATE INDEX IF NOT EXISTS idx_hotel_users_email
    ON hotel.users (email);

CREATE INDEX IF NOT EXISTS idx_hotel_users_role
    ON hotel.users (role);
