from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta

from pydantic import BaseModel, EmailStr, Field, field_validator

# Digits with an optional leading +. Country code is concatenated client-side.
_PHONE_RE = r"^\+?[1-9]\d{7,14}$"

# The hotel is in India; "today" must be its today, not the server's UTC date.
IST = timedelta(hours=5, minutes=30)
RESERVATION_WINDOW_DAYS = 7


def _local_today() -> date:
    return (datetime.now(UTC) + IST).date()


class TableReservationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr | None = None  # optional in the form
    phone: str = Field(pattern=_PHONE_RE, max_length=20)
    guests: int = Field(ge=1, le=20)
    reserve_date: date
    reserve_time: time
    special_requests: str | None = Field(default=None, max_length=300)

    @field_validator("reserve_date")
    @classmethod
    def within_booking_window(cls, value: date) -> date:
        # The 7-day limit in ReserveTable.tsx is a UI hint, not a control.
        today = _local_today()
        if not today <= value <= today + timedelta(days=RESERVATION_WINDOW_DAYS):
            raise ValueError(f"reserve_date must be within the next {RESERVATION_WINDOW_DAYS} days")
        return value


class ContactMessageRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    message: str = Field(min_length=5, max_length=1000)

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str | None) -> str | None:
        import re

        if value and not re.match(_PHONE_RE, value):
            raise ValueError("invalid phone number")
        return value or None
