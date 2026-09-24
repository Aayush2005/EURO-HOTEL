from __future__ import annotations

import logging
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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])
payment_engine = PaymentEngine()
limiter = Limiter(key_func=get_remote_address)


@router.post("/return", include_in_schema=False)
@limiter.limit("30/minute")
async def hdfc_payment_return(
    request: Request,
    order_id: str | None = Form(default=None),
    status: str | None = Form(default=None),
    signature: str | None = Form(default=None),
    connection: Connection = Depends(get_db),
):
    """
    HDFC SmartGateway POSTs form data here after payment completes, then the
    browser is redirected to the frontend status page.

    The posted `status` is never trusted — settlement is read from HDFC's own
    API. Syncing here rather than leaving it to /payments/status means a guest
    who closes the tab still gets their booking confirmed and notified.
    """
    if not order_id:
        qs = urlencode({"error": "missing_order"})
        return RedirectResponse(
            url=f"{settings.frontend_url.rstrip('/')}/payment/status?{qs}",
            status_code=303,
        )

    if signature and not HDFCService.verify_return_signature(order_id, signature):
        logger.warning("HDFC return signature mismatch order_id=%s — skipping sync", order_id)
    else:
        try:
            await payment_engine.check_and_sync_once(connection, order_id)
        except Exception:
            # Never block the redirect — /payments/status is still the fallback.
            logger.exception("HDFC return sync failed order_id=%s", order_id)

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
