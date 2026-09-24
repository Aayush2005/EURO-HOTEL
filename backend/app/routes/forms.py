"""Public lead-capture endpoints: dining table requests and contact enquiries.

Both persist first and notify second — a WhatsApp outage must never lose a lead.
"""
from __future__ import annotations

from asyncpg import Connection
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.db import get_db
from app.schemas.forms import ContactMessageRequest, TableReservationRequest
from app.whatsapp import fire, notify_contact, notify_table_reservation

router = APIRouter(tags=["forms"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/reservations/table", status_code=201)
@limiter.limit("5/minute")
async def create_table_reservation(
    payload: TableReservationRequest,
    request: Request,
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        """
        INSERT INTO hotel.table_reservations
            (name, email, phone, guests, reserve_date, reserve_time, special_requests)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        """,
        payload.name,
        payload.email,
        payload.phone,
        payload.guests,
        payload.reserve_date,
        payload.reserve_time,
        payload.special_requests,
    )

    fire(notify_table_reservation(
        phone=payload.phone,
        name=payload.name,
        email=payload.email,
        reserve_date=payload.reserve_date.strftime("%d %b %Y"),
        reserve_time=payload.reserve_time.strftime("%I:%M %p").lstrip("0"),
        guests=payload.guests,
        special_requests=payload.special_requests,
    ))

    return {"id": row["id"], "status": "requested"}


@router.post("/contact", status_code=201)
@limiter.limit("3/minute")
async def create_contact_message(
    payload: ContactMessageRequest,
    request: Request,
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        """
        INSERT INTO hotel.contact_messages (name, email, phone, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        """,
        payload.name,
        payload.email,
        payload.phone,
        payload.message,
    )

    fire(notify_contact(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        message=payload.message,
    ))

    return {"id": row["id"], "status": "received"}
