from __future__ import annotations

import asyncio
import json
import re
from datetime import UTC, datetime
from decimal import Decimal

from asyncpg import Connection
from fastapi import HTTPException

from app.config import settings
from app.email import send_booking_confirmed_email
from app.services.hdfc_service import HDFCService

TERMINAL_PAYMENT_STATUSES = {"success", "failed", "expired"}


class PaymentEngine:
    def __init__(self) -> None:
        self.gateway = HDFCService()

    async def initiate_payment(self, connection: Connection, booking_id: int, return_url: str | None = None) -> dict:
        row = await connection.fetchrow(
            """
            SELECT p.id, p.order_id, p.payment_status, p.amount, p.booking_id,
                   b.guest_email, b.guest_phone
            FROM hotel.payments p
            JOIN hotel.bookings b ON b.id = p.booking_id
            WHERE p.booking_id = $1
            """,
            booking_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Payment record not found")

        payment = dict(row)
        if payment["payment_status"] in {"success", "initiated"}:
            return self._payload(
                order_id=payment["order_id"],
                amount=Decimal(str(payment["amount"])),
                payment_status=payment["payment_status"],
            )

        customer_id = f"guest_{payment['order_id']}"
        phone_raw = re.sub(r"\D", "", str(payment["guest_phone"]))
        hdfc_phone = phone_raw[-10:] if len(phone_raw) >= 10 else phone_raw
        gateway_response = await self.gateway.create_session(
            order_id=payment["order_id"],
            amount=str(payment["amount"]),
            customer_id=customer_id,
            customer_email=str(payment["guest_email"]),
            customer_phone=hdfc_phone,
            return_url=return_url or f"{settings.frontend_url.rstrip('/')}/payment/return",
        )
        now = datetime.now(UTC)
        await connection.execute(
            """
            UPDATE hotel.payments
            SET payment_status = 'initiated', gateway_response = $2::jsonb, updated_at = $3
            WHERE id = $1
            """,
            payment["id"],
            gateway_response,
            now,
        )
        return self._payload(
            order_id=payment["order_id"],
            amount=Decimal(str(payment["amount"])),
            payment_status="initiated",
            gateway_response=gateway_response,
        )

    async def poll_and_sync_status(self, connection: Connection, order_id: str, timeout_seconds: int = 300) -> dict:
        started = datetime.now(UTC)
        customer_id = f"guest_{order_id}"

        while (datetime.now(UTC) - started).total_seconds() < timeout_seconds:
            status_data = await self.gateway.fetch_order_status(order_id=order_id, customer_id=customer_id)
            mapped_status = self._map_gateway_status(status_data)
            await self._apply_status(connection, order_id, mapped_status, status_data)
            if mapped_status in TERMINAL_PAYMENT_STATUSES:
                return await self._fetch_status(connection, order_id)
            await asyncio.sleep(5)

        await self._apply_status(connection, order_id, "expired", {"reason": "poll_timeout"})
        return await self._fetch_status(connection, order_id)

    async def get_status(self, connection: Connection, order_id: str) -> dict:
        return await self._fetch_status(connection, order_id)

    async def check_and_sync_once(self, connection: Connection, order_id: str) -> dict:
        """Single gateway probe: fetch status once, persist, return current state."""
        customer_id = f"guest_{order_id}"
        status_data = await self.gateway.fetch_order_status(order_id=order_id, customer_id=customer_id)
        mapped_status = self._map_gateway_status(status_data)
        await self._apply_status(connection, order_id, mapped_status, status_data)
        return await self._fetch_status(connection, order_id)

    async def _send_confirmation_if_success(self, connection: Connection, booking_id: int) -> None:
        row = await connection.fetchrow(
            """
            SELECT guest_name, guest_email, booking_reference,
                   check_in::text, check_out::text, total_amount, total_guests, special_requests
            FROM hotel.bookings WHERE id = $1
            """,
            booking_id,
        )
        if not row:
            return
        import asyncio
        asyncio.create_task(send_booking_confirmed_email(
            to_email=row["guest_email"],
            guest_name=row["guest_name"],
            booking_reference=row["booking_reference"],
            check_in=row["check_in"],
            check_out=row["check_out"],
            total_amount=f"{int(row['total_amount']):,}",
            total_guests=row["total_guests"],
            special_requests=row["special_requests"],
        ))

    async def _apply_status(self, connection: Connection, order_id: str, status: str, gateway_response: dict) -> None:
        now = datetime.now(UTC)
        booking_status = "confirmed" if status == "success" else "payment_failed" if status in {"failed", "expired"} else "pending"

        # Pre-serialize to avoid asyncpg jsonb codec type-inference issues with pgbouncer
        gateway_json = json.dumps(gateway_response)

        # Extract optional string fields; explicit ::text cast avoids untyped-NULL errors
        txn_id = (str(gateway_response.get("txn_id") or gateway_response.get("transaction_id") or "").strip()) or None
        gw_payment_id = (str(gateway_response.get("payment_id") or gateway_response.get("gateway_payment_id") or "").strip()) or None
        paid_at = now if status == "success" else None

        async with connection.transaction():
            payment_row = await connection.fetchrow(
                """
                UPDATE hotel.payments
                SET payment_status = $2,
                    gateway_response = $3::jsonb,
                    updated_at = $4,
                    paid_at = COALESCE(paid_at, $5),
                    transaction_id = COALESCE(transaction_id, $6::text),
                    gateway_payment_id = COALESCE(gateway_payment_id, $7::text)
                WHERE order_id = $1
                RETURNING booking_id, amount
                """,
                order_id,
                status,
                gateway_json,
                now,
                paid_at,
                txn_id,
                gw_payment_id,
            )
            if not payment_row:
                raise HTTPException(status_code=404, detail="Order not found")

            is_terminal = status in TERMINAL_PAYMENT_STATUSES
            should_send_confirmation = status == "success"

            await connection.execute(
                """
                UPDATE hotel.bookings
                SET booking_status = $2,
                    updated_at = $3,
                    hold_expires_at = CASE WHEN $4 THEN NULL ELSE hold_expires_at END
                WHERE id = $1 AND booking_status IN ('pending', 'payment_failed')
                """,
                payment_row["booking_id"],
                booking_status,
                now,
                is_terminal,
            )

        if should_send_confirmation:
            await self._send_confirmation_if_success(connection, payment_row["booking_id"])

    async def _fetch_status(self, connection: Connection, order_id: str) -> dict:
        row = await connection.fetchrow(
            """
            SELECT p.order_id, p.payment_status, p.amount, b.booking_status
            FROM hotel.payments p
            JOIN hotel.bookings b ON b.id = p.booking_id
            WHERE p.order_id = $1
            """,
            order_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        return dict(row)

    def _payload(self, *, order_id: str, amount: Decimal, payment_status: str, gateway_response: dict | None = None) -> dict:
        payment_links = (gateway_response or {}).get("payment_links")
        sdk_payload = (gateway_response or {}).get("sdk_payload")
        return {
            "order_id": order_id,
            "merchant_id": settings.hdfc_merchant_id,
            "amount": amount,
            "currency": "INR",
            "redirect_url": f"{settings.frontend_url.rstrip('/')}/payment/status?order_id={order_id}",
            "payment_status": payment_status,
            "payment_links": payment_links,
            "sdk_payload": sdk_payload,
        }

    def _map_gateway_status(self, status_data: dict) -> str:
        # SmartGateway-style order status mapping to our internal statuses.
        raw = str(status_data.get("status") or status_data.get("order_status") or "").upper()
        if raw in {"CHARGED", "SUCCESS", "CAPTURED"}:
            return "success"
        if raw in {"PENDING", "CREATED", "NEW", "AUTHORIZING", "AUTHORISED", "AUTHORIZED"}:
            return "initiated"
        if raw in {"FAILED", "FAILURE", "DECLINED", "ABORTED", "CANCELLED", "CANCELED"}:
            return "failed"
        if raw in {"EXPIRED"}:
            return "expired"
        return "pending"
