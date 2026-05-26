from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from asyncpg import Connection
from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.auth.dependencies import require_roles
from app.config import settings
from app.db import get_db
from app.email import send_cancellation_approved_email
from app.schemas.booking import AssignRoomRequest, ManualBookingRequest, ReassignRoomRequest
from app.services.allocation_engine import AllocationEngine
from app.services.booking_engine import BookingEngine
from app.services.payment_engine import PaymentEngine

router = APIRouter(prefix="/admin/bookings", tags=["admin-bookings"])
payment_engine = PaymentEngine()


@router.get("")
async def list_all_bookings(
    status: str | None = Query(None),
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager", "receptionist"])),
    connection: Connection = Depends(get_db),
) -> list[dict]:
    params: list[Any] = []
    status_filter = ""
    if status and status != "all":
        params.append(status)
        status_filter = f"AND b.booking_status = ${len(params)}"

    rows = await connection.fetch(
        f"""
        SELECT
            b.id,
            b.booking_reference,
            b.booking_status,
            b.guest_name,
            b.guest_email,
            b.guest_phone,
            b.total_guests,
            b.check_in,
            b.check_out,
            b.total_amount,
            b.special_requests,
            b.created_at,
            b.cancellation_requested_at,
            b.cancellation_reason,
            b.user_id::text AS user_id,
            p.payment_status,
            p.order_id,
            u.full_name AS user_full_name,
            u.email AS user_email,
            (SELECT COUNT(*)::int FROM hotel.booking_rooms br WHERE br.booking_id = b.id) AS total_rooms,
            (SELECT COUNT(*)::int FROM hotel.booking_rooms br WHERE br.booking_id = b.id AND br.room_id IS NOT NULL) AS allocated_rooms
        FROM hotel.bookings b
        JOIN hotel.payments p ON p.booking_id = b.id
        LEFT JOIN hotel.users u ON u.id = b.user_id
        WHERE 1=1 {status_filter}
        ORDER BY b.created_at DESC
        """,
        *params,
    )
    result = []
    for r in rows:
        d = dict(r)
        for k, v in d.items():
            if hasattr(v, "isoformat"):
                d[k] = v.isoformat()
        result.append(d)
    return result


@router.post("/manual")
async def manual_booking(
    payload: ManualBookingRequest,
    request: Request,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager", "receptionist"])),
    connection: Connection = Depends(get_db),
) -> dict:
    user_id = UUID(payload.user_id) if payload.user_id else None
    booking = await BookingEngine.create_booking_with_payment(connection, payload, user_id)
    backend_return_url = f"{settings.backend_url.rstrip('/')}/payments/return"
    payment = await payment_engine.initiate_payment(connection, int(booking["id"]), return_url=backend_return_url)
    return {"booking": booking, "payment": payment}


@router.post("/assign-room")
async def assign_room(
    payload: AssignRoomRequest,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager", "receptionist"])),
    connection: Connection = Depends(get_db),
) -> dict:
    await AllocationEngine.assign_room(connection, payload.booking_room_id, payload.room_id)
    return {"status": "assigned"}


@router.post("/reassign-room")
async def reassign_room(
    payload: ReassignRoomRequest,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager", "receptionist"])),
    connection: Connection = Depends(get_db),
) -> dict:
    await AllocationEngine.assign_room(connection, payload.booking_room_id, payload.new_room_id)
    return {"status": "reassigned"}


@router.post("/{booking_id}/auto-allocate")
async def auto_allocate(
    booking_id: int,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager", "receptionist"])),
    connection: Connection = Depends(get_db),
) -> dict:
    assignments = await AllocationEngine.auto_allocate_for_booking(connection, booking_id)
    return {"assigned": assignments, "count": len(assignments)}


@router.post("/{booking_id}/approve-cancellation")
async def approve_cancellation(
    booking_id: int,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager"])),
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        """
        SELECT id, booking_status, cancellation_requested_at,
               guest_name, guest_email, booking_reference,
               check_in::text, check_out::text
        FROM hotel.bookings WHERE id = $1
        """,
        booking_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not row["cancellation_requested_at"]:
        raise HTTPException(status_code=400, detail="No cancellation requested for this booking")

    now = datetime.now(UTC)
    await connection.execute(
        "UPDATE hotel.bookings SET booking_status = 'cancelled', updated_at = $2 WHERE id = $1",
        booking_id, now,
    )

    import asyncio
    asyncio.create_task(send_cancellation_approved_email(
        to_email=row["guest_email"],
        guest_name=row["guest_name"],
        booking_reference=row["booking_reference"],
        check_in=row["check_in"],
        check_out=row["check_out"],
    ))

    return {"status": "cancelled"}


@router.post("/{booking_id}/reject-cancellation")
async def reject_cancellation(
    booking_id: int,
    _admin: dict[str, Any] = Depends(require_roles(["admin", "manager"])),
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        "SELECT id, cancellation_requested_at FROM hotel.bookings WHERE id = $1",
        booking_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not row["cancellation_requested_at"]:
        raise HTTPException(status_code=400, detail="No cancellation requested for this booking")

    now = datetime.now(UTC)
    await connection.execute(
        """
        UPDATE hotel.bookings
        SET cancellation_requested_at = NULL, cancellation_reason = NULL, updated_at = $2
        WHERE id = $1
        """,
        booking_id, now,
    )
    return {"status": "rejected"}
