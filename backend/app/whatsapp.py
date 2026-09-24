"""WhatsApp Cloud API notifications.

Mirrors app/email.py: module-level async helpers, graceful no-op when unconfigured,
never raises into the caller. Sends approved template messages only — free-form text
is rejected by Meta outside the 24h customer-service window.
"""
from __future__ import annotations

import asyncio
import logging
import re
from typing import Any, Coroutine

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.facebook.com"
_E164 = re.compile(r"^\+[1-9]\d{7,14}$")

# Holds strong references to in-flight background sends. Without this the event
# loop can garbage-collect a task mid-send and the message is silently dropped.
_tasks: set[asyncio.Task] = set()


def _task_done(task: asyncio.Task) -> None:
    _tasks.discard(task)
    if not task.cancelled() and task.exception() is not None:
        logger.error("Background notification failed: %s", task.exception())


def fire(coro: Coroutine[Any, Any, Any]) -> None:
    """Run a notification in the background without blocking the response."""
    task = asyncio.create_task(coro)
    _tasks.add(task)
    task.add_done_callback(_task_done)


def normalize_phone(raw: str | None) -> str | None:
    """Return an E.164 number, or None if it can't be trusted (caller skips the send)."""
    if not raw:
        return None
    stripped = re.sub(r"[^\d+]", "", str(raw))
    had_plus = stripped.startswith("+")
    digits = stripped.lstrip("+")
    if not had_plus:
        digits = digits.lstrip("0")  # national trunk prefix
    if not digits:
        return None
    # ponytail: a bare 10-digit mobile means India — every form defaults to +91.
    if not had_plus and len(digits) == 10 and digits[0] in "6789":
        digits = "91" + digits
    candidate = "+" + digits
    return candidate if _E164.match(candidate) else None


def clean(text: Any, limit: int = 200) -> str:
    """Template parameters reject newlines and 4+ consecutive spaces (error 132000)."""
    if text is None:
        return ""
    collapsed = re.sub(r"\s+", " ", str(text)).strip()
    return collapsed[: limit - 1] + "…" if len(collapsed) > limit else collapsed


def _mask(number: str) -> str:
    return f"{number[:3]}…{number[-4:]}" if len(number) > 7 else "…"


async def send_template(to: str | None, template: str, params: list[str]) -> bool:
    """`template` is "name" or "name:lang" — approved templates differ in language code
    (e.g. lead_alert is en_US while thank_you_message is en), so it travels with the name."""
    if not (settings.whatsapp_token and settings.whatsapp_phone_number_id and template):
        logger.warning("WhatsApp not configured — skipping template %r", template or "<unset>")
        return False

    template_name, _, lang = template.partition(":")
    lang = lang or settings.whatsapp_template_lang

    number = normalize_phone(to)
    if not number:
        logger.warning("WhatsApp: unusable recipient number — skipping template %r", template_name)
        return False

    body: dict[str, Any] = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": lang},
        },
    }
    if params:
        body["template"]["components"] = [
            {"type": "body", "parameters": [{"type": "text", "text": p} for p in params]}
        ]

    url = f"{GRAPH_BASE}/{settings.whatsapp_api_version}/{settings.whatsapp_phone_number_id}/messages"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url, json=body, headers={"Authorization": f"Bearer {settings.whatsapp_token}"}
            )
        if response.status_code >= 400:
            # Meta's error body carries no credentials — safe to log for debugging.
            logger.error(
                "WhatsApp send failed template=%s to=%s status=%s body=%s",
                template_name, _mask(number), response.status_code, response.text[:500],
            )
            return False
        message_id = (response.json().get("messages") or [{}])[0].get("id")
        logger.info("WhatsApp sent template=%s to=%s id=%s", template_name, _mask(number), message_id)
        return True
    except Exception as exc:
        logger.error("WhatsApp send error template=%s to=%s: %s", template_name, _mask(number), exc)
        return False


# --- Event wrappers -------------------------------------------------------
# Parameter order must match the approved template exactly — a mismatched count
# is rejected by Meta (error 132000). Templates in use today:
#
#   lead_alert (en_US)        {{1}} Name  {{2}} Phone  {{3}} Email  {{4}} City  {{5}} Campaign
#   thank_you_message (en)    {{1}} Name
#
# lead_alert's "City" and "Campaign" slots are reused to carry the event detail —
# a stopgap until purpose-built utility templates are approved.


async def notify_room_booking(
    *,
    guest_phone: str | None,
    guest_name: str,
    booking_reference: str,
    check_in: str,
    check_out: str,
    total_guests: int,
    total_amount: str,
) -> None:
    """Parked: WA_TPL_ROOM_* are intentionally blank, so both sends no-op. Room
    confirmations stay email-only until a utility template is approved."""
    await send_template(guest_phone, settings.wa_tpl_room_guest, [
        clean(guest_name, 60), clean(booking_reference, 20),
        clean(check_in), clean(check_out), str(total_guests), clean(total_amount, 20),
    ])
    await send_template(settings.whatsapp_internal_number, settings.wa_tpl_room_staff, [
        clean(booking_reference, 20), clean(guest_name, 60), clean(guest_phone, 20),
        clean(check_in), clean(check_out), str(total_guests), clean(total_amount, 20),
    ])


async def notify_table_reservation(
    *,
    phone: str | None,
    name: str,
    email: str | None,
    reserve_date: str,
    reserve_time: str,
    guests: int,
    special_requests: str | None,
) -> None:
    await send_template(phone, settings.wa_tpl_table_guest, [clean(name, 60)])
    await send_template(settings.whatsapp_internal_number, settings.wa_tpl_table_staff, [
        clean(name, 60),
        clean(phone, 20) or "Not provided",
        clean(email, 100) or "Not provided",
        f"Table for {guests} on {clean(reserve_date)} at {clean(reserve_time)}",
        clean(f"Dining reservation. {special_requests}" if special_requests else "Dining reservation", 300),
    ])


async def notify_contact(*, name: str, phone: str | None, email: str, message: str) -> None:
    await send_template(settings.whatsapp_internal_number, settings.wa_tpl_contact_staff, [
        clean(name, 60),
        clean(phone, 20) or "Not provided",
        clean(email, 100) or "Not provided",
        "Contact form",
        clean(message, 600),
    ])
