from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


BookingStatus = Literal["pending", "confirmed", "checked_in", "checked_out", "cancelled", "payment_failed", "no_show"]
PaymentStatus = Literal["pending", "initiated", "success", "failed", "cancelled", "refunded", "expired"]


class BookingRoomRequest(BaseModel):
    room_type_id: int
    quantity: int = Field(ge=1, le=20)
    guests_count: int = Field(ge=1, le=10)


class BookingCreateRequest(BaseModel):
    idempotency_key: str = Field(min_length=8, max_length=100)
    guest_name: str = Field(min_length=2, max_length=150)
    guest_email: EmailStr
    guest_phone: str = Field(min_length=7, max_length=20)
    total_guests: int = Field(ge=1, le=40)
    check_in: date
    check_out: date
    special_requests: str | None = Field(default=None, max_length=1000)
    rooms: list[BookingRoomRequest] = Field(min_length=1, max_length=10)


class PaymentInitiateRequest(BaseModel):
    booking_id: int


class PaymentStatusResponse(BaseModel):
    order_id: str
    payment_status: PaymentStatus
    booking_status: BookingStatus
    amount: Decimal


class PaymentPayload(BaseModel):
    order_id: str
    merchant_id: str
    amount: Decimal
    currency: str = "INR"
    redirect_url: str
    payment_status: PaymentStatus
    payment_links: dict | None = None
    sdk_payload: dict | None = None


class BookingCreateResponse(BaseModel):
    booking_id: int
    booking_reference: str
    booking_status: BookingStatus
    payment_status: PaymentStatus
    hold_expires_at: datetime | None = None
    payment: PaymentPayload


class CancellationRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


class BookingSummary(BaseModel):
    id: int
    booking_reference: str
    booking_status: BookingStatus
    payment_status: PaymentStatus
    guest_name: str
    check_in: date
    check_out: date
    total_amount: Decimal
    created_at: datetime
    cancellation_requested_at: datetime | None = None


class BookingDetails(BookingSummary):
    guest_email: EmailStr
    guest_phone: str
    total_guests: int
    special_requests: str | None
    rooms: list[dict]


class ManualBookingRequest(BookingCreateRequest):
    user_id: str | None = None


class AssignRoomRequest(BaseModel):
    booking_room_id: int
    room_id: int


class ReassignRoomRequest(BaseModel):
    booking_room_id: int
    new_room_id: int
