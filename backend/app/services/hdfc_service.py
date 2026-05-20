from __future__ import annotations

import base64
import hashlib
import hmac
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class HDFCGatewayError(Exception):
    pass


class HDFCService:
    def __init__(self) -> None:
        token = base64.b64encode(f"{settings.hdfc_api_key}:".encode("utf-8")).decode("utf-8")
        self._base_headers = {
            "Authorization": f"Basic {token}",
            "x-merchantid": settings.hdfc_merchant_id,
            "Content-Type": "application/json",
        }

    async def create_session(
        self,
        *,
        order_id: str,
        amount: str,
        customer_id: str,
        customer_email: str,
        customer_phone: str,
        return_url: str,
    ) -> dict:
        url = f"{settings.hdfc_base_url.rstrip('/')}/session"
        headers = {
            **self._base_headers,
            "x-customerid": customer_id,
            "x-resellerid": settings.hdfc_reseller_id,
        }
        payload = {
            "order_id": order_id,
            "amount": amount,
            "customer_id": customer_id,
            "customer_email": customer_email,
            "customer_phone": customer_phone,
            "payment_page_client_id": settings.hdfc_payment_page_client_id,
            "action": "paymentPage",
            "return_url": return_url,
            "currency": "INR",
            "description": "Euro Hotel Booking Payment",
        }

        if settings.hdfc_enable_logging:
            logger.info("HDFC create_session request order_id=%s", order_id)

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                if settings.hdfc_enable_logging:
                    logger.info("HDFC create_session response order_id=%s keys=%s", order_id, list(data.keys()))
                return data
            except httpx.HTTPError as exc:
                if settings.hdfc_enable_logging:
                    logger.exception("HDFC create_session failed order_id=%s", order_id)
                raise HDFCGatewayError("session_creation_failed") from exc

    @staticmethod
    def verify_return_signature(order_id: str, received_signature: str) -> bool:
        """Verify HDFC's HMAC-SHA256 signature on the return URL response."""
        if not settings.hdfc_response_key:
            raise RuntimeError("HDFC_RESPONSE_KEY is not configured — cannot verify payment callback signature")
        expected = hmac.new(
            key=settings.hdfc_response_key.encode("utf-8"),
            msg=order_id.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, received_signature.lower())

    async def fetch_order_status(self, *, order_id: str, customer_id: str) -> dict:
        url = f"{settings.hdfc_base_url.rstrip('/')}/orders/{order_id}"
        headers = {
            **self._base_headers,
            "x-routing-id": customer_id,
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as exc:
                if settings.hdfc_enable_logging:
                    logger.exception("HDFC fetch_order_status failed order_id=%s", order_id)
                raise HDFCGatewayError("status_check_failed") from exc
