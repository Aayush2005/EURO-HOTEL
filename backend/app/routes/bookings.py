from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any
from uuid import UUID

from asyncpg import Connection
from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.auth.dependencies import get_current_user, get_current_user_optional
from app.db import get_db
from app.schemas.booking import (
    BookingCreateRequest, BookingCreateResponse, BookingDetails,
    BookingSummary, CancellationRequest,
)
from app.services.booking_engine import BookingEngine
from app.services.payment_engine import PaymentEngine

router = APIRouter(prefix="/bookings", tags=["bookings"])
payment_engine = PaymentEngine()


@router.get("/availability/{room_type_id}")
async def room_type_availability(
    room_type_id: int,
    check_in: date = Query(...),
    check_out: date = Query(...),
    connection: Connection = Depends(get_db),
) -> dict:
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")
    available = await BookingEngine._available_units(connection, room_type_id, check_in, check_out)
    return {"available": available}


@router.post("/create", response_model=BookingCreateResponse)
async def create_booking(
    payload: BookingCreateRequest,
    request: Request,
    user: dict[str, Any] | None = Depends(get_current_user_optional),
    connection: Connection = Depends(get_db),
) -> BookingCreateResponse:
    user_id = UUID(str(user["id"])) if user else None
    booking = await BookingEngine.create_booking_with_payment(connection, payload, user_id)
    backend_return_url = str(request.base_url).rstrip("/") + "/payments/return"
    payment_payload = await payment_engine.initiate_payment(connection, int(booking["id"]), return_url=backend_return_url)
    return BookingCreateResponse(
        booking_id=int(booking["id"]),
        booking_reference=str(booking["booking_reference"]),
        booking_status=str(booking["booking_status"]),
        payment_status=str(payment_payload["payment_status"]),
        hold_expires_at=booking.get("hold_expires_at"),
        payment=payment_payload,
    )


@router.get("/me", response_model=list[BookingSummary])
async def my_bookings(
    user: dict[str, Any] = Depends(get_current_user),
    connection: Connection = Depends(get_db),
) -> list[BookingSummary]:
    rows = await connection.fetch(
        """
        SELECT b.id, b.booking_reference, b.booking_status, p.payment_status,
               b.guest_name, b.check_in, b.check_out, b.total_amount, b.created_at,
               b.cancellation_requested_at
        FROM hotel.bookings b
        JOIN hotel.payments p ON p.booking_id = b.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
        """,
        UUID(str(user["id"])),
    )
    return [BookingSummary(**dict(r)) for r in rows]


@router.get("/{booking_id}", response_model=BookingDetails)
async def booking_by_id(
    booking_id: int,
    user: dict[str, Any] = Depends(get_current_user),
    connection: Connection = Depends(get_db),
) -> BookingDetails:
    row = await connection.fetchrow(
        """
        SELECT b.id, b.user_id, b.booking_reference, b.booking_status, p.payment_status,
               b.guest_name, b.guest_email, b.guest_phone, b.total_guests,
               b.check_in, b.check_out, b.total_amount, b.special_requests, b.created_at
        FROM hotel.bookings b
        JOIN hotel.payments p ON p.booking_id = b.id
        WHERE b.id = $1
        """,
        booking_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="booking not found")

    item = dict(row)
    is_staff = user["role"] in {"admin", "manager", "receptionist"}
    booking_user_id = item.get("user_id")
    if booking_user_id is None:
        # Guest booking — any authenticated non-staff user is denied
        if not is_staff:
            raise HTTPException(status_code=403, detail="access denied")
    elif str(booking_user_id) != str(user["id"]) and not is_staff:
        raise HTTPException(status_code=403, detail="access denied")

    rooms = await connection.fetch(
        """
        SELECT br.id, br.room_id, br.room_type_id, br.guests_count, br.price_per_night, br.total_nights
        FROM hotel.booking_rooms br
        WHERE br.booking_id = $1
        ORDER BY br.id
        """,
        booking_id,
    )
    item["rooms"] = [dict(r) for r in rooms]
    return BookingDetails(**item)


@router.post("/{booking_id}/cancel-request")
async def request_cancellation(
    booking_id: int,
    payload: CancellationRequest,
    user: dict[str, Any] = Depends(get_current_user),
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        """
        SELECT id, user_id, booking_status, cancellation_requested_at
        FROM hotel.bookings WHERE id = $1
        """,
        booking_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(row["user_id"]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    status = row["booking_status"]
    if status in ("checked_in", "checked_out", "cancelled", "no_show"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {status} booking")
    if row["cancellation_requested_at"] is not None:
        raise HTTPException(status_code=409, detail="Cancellation already requested")

    now = datetime.now(UTC)

    # Unpaid pending bookings are cancelled immediately — no money involved
    if status == "pending":
        await connection.execute(
            "UPDATE hotel.bookings SET booking_status = 'cancelled', updated_at = $2 WHERE id = $1",
            booking_id, now,
        )
        await connection.execute(
            "UPDATE hotel.payments SET payment_status = 'cancelled', updated_at = $2 WHERE booking_id = $1",
            booking_id, now,
        )
        return {"status": "cancelled"}

    # Confirmed / payment_failed: record the request for admin review
    await connection.execute(
        """
        UPDATE hotel.bookings
        SET cancellation_requested_at = $2, cancellation_reason = $3, updated_at = $2
        WHERE id = $1
        """,
        booking_id, now, payload.reason or None,
    )
    return {"status": "cancellation_requested"}
