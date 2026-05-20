from __future__ import annotations

import secrets
import string
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from asyncpg import Connection
from fastapi import HTTPException

from app.schemas.booking import BookingCreateRequest

ACTIVE_STATUSES = ("pending", "confirmed", "checked_in")
HOLD_MINUTES = 30
ALPHANUM = string.ascii_uppercase + string.digits


def _gen_code(prefix: str, length: int) -> str:
    return prefix + "".join(secrets.choice(ALPHANUM) for _ in range(length - len(prefix)))


class BookingEngine:
    @staticmethod
    async def _generate_unique_booking_reference(connection: Connection) -> str:
        for _ in range(20):
            ref = _gen_code("BK", 12)
            exists = await connection.fetchval("SELECT 1 FROM hotel.bookings WHERE booking_reference = $1", ref)
            if not exists:
                return ref
        raise HTTPException(status_code=500, detail="Could not generate booking reference")

    @staticmethod
    async def _generate_unique_order_id(connection: Connection) -> str:
        for _ in range(20):
            order_id = _gen_code("HTL", 12)
            exists = await connection.fetchval("SELECT 1 FROM hotel.payments WHERE order_id = $1", order_id)
            if not exists:
                return order_id
        raise HTTPException(status_code=500, detail="Could not generate order id")

    @staticmethod
    async def _available_units(connection: Connection, room_type_id: int, check_in: date, check_out: date) -> int:
        """
        Count rooms available for the given type and date range.
        Pending bookings with an expired hold are treated as released inventory.
        Must be called inside a transaction with the room_type row locked (FOR UPDATE)
        to prevent race conditions.
        """
        row = await connection.fetchrow(
            """
            WITH eligible_rooms AS (
                SELECT r.id
                FROM hotel.rooms r
                WHERE r.room_type_id = $1
                  AND r.status NOT IN ('maintenance', 'out_of_service')
            ), active_bookings AS (
                -- pending bookings only count if their hold has not expired
                SELECT b.id
                FROM hotel.bookings b
                WHERE b.booking_status = ANY($2::text[])
                  AND b.check_in  < $4
                  AND b.check_out > $3
                  AND NOT (
                      b.booking_status = 'pending'
                      AND b.hold_expires_at IS NOT NULL
                      AND b.hold_expires_at <= NOW()
                  )
            ), blocked_rooms AS (
                SELECT DISTINCT br.room_id
                FROM hotel.booking_rooms br
                WHERE br.room_type_id = $1
                  AND br.room_id IS NOT NULL
                  AND br.booking_id IN (SELECT id FROM active_bookings)
            ), reserved_unallocated AS (
                SELECT COUNT(*) AS cnt
                FROM hotel.booking_rooms br
                WHERE br.room_type_id = $1
                  AND br.room_id IS NULL
                  AND br.booking_id IN (SELECT id FROM active_bookings)
            )
            SELECT (
                (SELECT COUNT(*) FROM eligible_rooms)
                - (SELECT COUNT(*) FROM blocked_rooms)
                - (SELECT cnt  FROM reserved_unallocated)
            )::int AS available;
            """,
            room_type_id,
            list(ACTIVE_STATUSES),
            check_in,
            check_out,
        )
        return max(int(row["available"] if row and row["available"] is not None else 0), 0)

    @staticmethod
    async def create_booking_with_payment(
        connection: Connection,
        payload: BookingCreateRequest,
        user_id: UUID | None,
        payment_gateway: str = "hdfc_smartgateway",
    ) -> dict:
        if payload.check_out <= payload.check_in:
            raise HTTPException(status_code=400, detail="check_out must be after check_in")

        existing = await connection.fetchrow(
            """
            SELECT b.id, b.booking_reference, b.booking_status, b.hold_expires_at,
                   p.order_id, p.payment_status, p.amount
            FROM hotel.payments p
            JOIN hotel.bookings b ON b.id = p.booking_id
            WHERE p.idempotency_key = $1
            """,
            payload.idempotency_key,
        )
        if existing:
            return dict(existing) | {"reused": True}

        nights = (payload.check_out - payload.check_in).days
        now = datetime.now(UTC)
        hold_expires_at = now + timedelta(minutes=HOLD_MINUTES)

        # Pre-compute pricing outside the transaction (read-only, no locking needed)
        total_guests_capacity = 0
        subtotal = Decimal("0.00")
        tax = Decimal("0.00")
        booking_room_rows: list[tuple[int, int, Decimal, int]] = []

        for room_req in payload.rooms:
            row = await connection.fetchrow(
                "SELECT id, base_price, tax_percent, max_occupancy, is_active FROM hotel.room_types WHERE id = $1",
                room_req.room_type_id,
            )
            if not row or not row["is_active"]:
                raise HTTPException(status_code=400, detail=f"Room type {room_req.room_type_id} is unavailable")

            price = Decimal(str(row["base_price"]))
            tax_percent = Decimal(str(row["tax_percent"]))
            total_guests_capacity += int(row["max_occupancy"]) * room_req.quantity
            line_subtotal = price * room_req.quantity * nights
            line_tax = (line_subtotal * tax_percent) / Decimal("100")
            subtotal += line_subtotal
            tax += line_tax

            for _ in range(room_req.quantity):
                booking_room_rows.append((room_req.room_type_id, room_req.guests_count, price, nights))

        if payload.total_guests > total_guests_capacity:
            raise HTTPException(status_code=400, detail="Guest count exceeds selected room capacity")

        total_amount = (subtotal + tax).quantize(Decimal("0.01"))
        booking_reference = await BookingEngine._generate_unique_booking_reference(connection)
        order_id = await BookingEngine._generate_unique_order_id(connection)

        async with connection.transaction():
            # Lock room_type rows to serialise concurrent booking attempts for the
            # same room type. The second concurrent request blocks here until the
            # first transaction commits, then re-checks availability below.
            for room_req in payload.rooms:
                await connection.fetchval(
                    "SELECT id FROM hotel.room_types WHERE id = $1 FOR UPDATE",
                    room_req.room_type_id,
                )

            # Authoritative availability check — runs inside the lock
            for room_req in payload.rooms:
                available = await BookingEngine._available_units(
                    connection, room_req.room_type_id, payload.check_in, payload.check_out
                )
                if available < room_req.quantity:
                    raise HTTPException(
                        status_code=409,
                        detail=f"No rooms available for room type {room_req.room_type_id}",
                    )

            booking_id = await connection.fetchval(
                """
                INSERT INTO hotel.bookings (
                    booking_reference, user_id, guest_name, guest_email, guest_phone,
                    total_guests, check_in, check_out, booking_status,
                    subtotal_amount, tax_amount, total_amount, special_requests,
                    hold_expires_at, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, 'pending',
                    $9, $10, $11, $12,
                    $13, $14, $14
                )
                RETURNING id
                """,
                booking_reference,
                user_id,
                payload.guest_name,
                payload.guest_email,
                payload.guest_phone,
                payload.total_guests,
                payload.check_in,
                payload.check_out,
                subtotal.quantize(Decimal("0.01")),
                tax.quantize(Decimal("0.01")),
                total_amount,
                payload.special_requests,
                hold_expires_at,
                now,
            )

            for room_type_id, guests_count, price_per_night, total_nights in booking_room_rows:
                await connection.execute(
                    """
                    INSERT INTO hotel.booking_rooms (
                        booking_id, room_id, room_type_id, guests_count,
                        price_per_night, total_nights, created_at
                    ) VALUES ($1, NULL, $2, $3, $4, $5, $6)
                    """,
                    booking_id,
                    room_type_id,
                    guests_count,
                    price_per_night.quantize(Decimal("0.01")),
                    total_nights,
                    now,
                )

            await connection.execute(
                """
                INSERT INTO hotel.payments (
                    booking_id, order_id, payment_gateway, payment_status,
                    amount, idempotency_key, created_at, updated_at
                ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $6)
                """,
                booking_id,
                order_id,
                payment_gateway,
                total_amount,
                payload.idempotency_key,
                now,
            )

        return {
            "id": booking_id,
            "booking_reference": booking_reference,
            "booking_status": "pending",
            "hold_expires_at": hold_expires_at,
            "order_id": order_id,
            "payment_status": "pending",
            "amount": total_amount,
            "reused": False,
        }
