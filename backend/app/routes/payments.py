from __future__ import annotations

from urllib.parse import urlencode

from asyncpg import Connection
from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.config import settings
from app.db import get_db
from app.schemas.booking import PaymentInitiateRequest, PaymentStatusResponse
from app.services.hdfc_service import HDFCService
from app.services.payment_engine import PaymentEngine

router = APIRouter(prefix="/payments", tags=["payments"])
payment_engine = PaymentEngine()
limiter = Limiter(key_func=get_remote_address)


@router.post("/return", include_in_schema=False)
async def hdfc_payment_return(
    order_id: str | None = Form(default=None),
    status: str | None = Form(default=None),
    signature: str | None = Form(default=None),
):
    """
    HDFC SmartGateway POSTs form data here after payment completes.
    Just redirects browser to the frontend status page — actual payment
    verification happens server-side in /payments/status via HDFC API.
    """
    if not order_id:
        qs = urlencode({"error": "missing_order"})
        return RedirectResponse(
            url=f"{settings.frontend_url.rstrip('/')}/payment/status?{qs}",
            status_code=303,
        )

    return RedirectResponse(
        url=f"{settings.frontend_url.rstrip('/')}/payment/status?{urlencode({'order_id': order_id})}",
        status_code=303,
    )


@router.post("/initiate")
async def initiate_payment(
    payload: PaymentInitiateRequest,
    _user: dict = Depends(get_current_user),
    connection: Connection = Depends(get_db),
) -> dict:
    return await payment_engine.initiate_payment(connection, payload.booking_id)


@router.get("/status/{order_id}", response_model=PaymentStatusResponse)
@limiter.limit("30/minute")
async def payment_status(
    request: Request,
    order_id: str,
    connection: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),
    signature: str | None = Query(default=None),
) -> PaymentStatusResponse:
    if signature and not HDFCService.verify_return_signature(order_id, signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Ownership check — fetch booking owner before exposing any payment data
    owner = await connection.fetchrow(
        """
        SELECT b.user_id
        FROM hotel.payments p
        JOIN hotel.bookings b ON b.id = p.booking_id
        WHERE p.order_id = $1
        """,
        order_id,
    )
    if not owner:
        raise HTTPException(status_code=404, detail="Order not found")

    is_staff = user["role"] in {"admin", "manager", "receptionist"}
    booking_user_id = owner["user_id"]

    if booking_user_id is None:
        # Guest booking (no account) — only staff may query status
        if not is_staff:
            raise HTTPException(status_code=403, detail="access denied")
    elif str(booking_user_id) != str(user["id"]) and not is_staff:
        raise HTTPException(status_code=403, detail="access denied")

    data = await payment_engine.check_and_sync_once(connection, order_id)
    return PaymentStatusResponse(**data)
