from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

class RoomType(str, Enum):
    EH_DELUXE_HIGHWAY_VIEW = "eh_deluxe_highway_view"
    EH_PREMIUM = "eh_premium"
    EH_SUPERIOR = "eh_superior"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    NO_SHOW = "no_show"
    FAILED = "failed"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    REFUNDED = "refunded"
    FAILED = "failed"

class CancellationPolicy(str, Enum):
    FREE_48H = "free_48h"
    NON_REFUNDABLE = "non_refundable"
    FLEXIBLE = "flexible"

# Nested models
class RoomImage(BaseModel):
    url: str
    alt: str
    is_primary: bool = False
    order: int = 1

class GuestDetails(BaseModel):
    name: str
    email: str
    phone: str
    id_type: str = "aadhar"
    id_number: str
    age: Optional[int] = None

class RoomBookingDetails(BaseModel):
    room_id: str
    room_number: Optional[str] = None
    start_date: date
    end_date: date
    nights: int
    base_price: float
    final_price: float

class PricingBreakdown(BaseModel):
    subtotal: float
    gst: float = 0.0
    service_charge: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    currency: str = "INR"

# Database models (match Supabase table structure)
class RoomDB(BaseModel):
    """Room model for database operations"""
    id: str
    slug: str
    title: str
    description: str
    room_type: RoomType
    amenities: List[str] = Field(default_factory=list)
    images: List[Dict[str, Any]] = Field(default_factory=list)
    base_price: float
    max_occupancy: int
    bed_configuration: str
    room_size: str
    floor: str
    view: str
    cancellation_policy: CancellationPolicy = CancellationPolicy.FREE_48H
    active: bool = True
    room_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class RoomInventoryDB(BaseModel):
    """Room inventory model for database operations"""
    id: str
    room_id: str
    date: date
    available_count: int
    locked_count: int = 0
    price_override: Optional[float] = None
    blocked_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BookingDB(BaseModel):
    """Booking model for database operations"""
    id: str
    booking_reference: str
    user_id: Optional[str] = None
    guest_details: Dict[str, Any]
    additional_guests: List[Dict[str, Any]] = Field(default_factory=list)
    room_bookings: List[Dict[str, Any]]
    total_guests: int
    special_requests: Optional[str] = None
    status: BookingStatus = BookingStatus.PENDING
    pricing: Dict[str, Any]
    payment_status: PaymentStatus = PaymentStatus.PENDING
    idempotency_key: str
    hold_expires_at: Optional[datetime] = None
    check_in_time: str = "14:00"
    check_out_time: str = "12:00"
    version: int = 1
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PaymentDB(BaseModel):
    """Payment model for database operations"""
    id: str
    booking_id: str
    provider: str = "razorpay"
    provider_payment_id: Optional[str] = None
    provider_order_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[str] = None
    captured_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PromoCodeDB(BaseModel):
    """Promo code model for database operations"""
    id: str
    code: str
    discount_type: str = "percentage"
    discount_value: float
    min_amount: float = 0
    max_discount: Optional[float] = None
    valid_from: datetime
    valid_until: datetime
    usage_limit: int = 100
    used_count: int = 0
    active: bool = True
    applicable_room_types: List[str] = Field(default_factory=lambda: ["all"])
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AuditLogDB(BaseModel):
    """Audit log model for database operations"""
    id: str
    actor: str
    action: str
    resource: str
    resource_id: str
    before: Dict[str, Any] = Field(default_factory=dict)
    after: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    class Config:
        from_attributes = True

# API Request/Response models
class RoomSearchRequest(BaseModel):
    start_date: date
    end_date: date
    guests: int = 1
    room_type: Optional[RoomType] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

class PriceCheckRequest(BaseModel):
    room_id: str
    start_date: date
    end_date: date
    guests: int
    promo_code: Optional[str] = None

class BookingHoldRequest(BaseModel):
    room_id: str
    start_date: date
    end_date: date
    guests: int
    guest_details: GuestDetails
    additional_guests: List[GuestDetails] = Field(default_factory=list)
    special_requests: Optional[str] = None
    promo_code: Optional[str] = None
    idempotency_key: str

class BookingConfirmRequest(BaseModel):
    hold_token: str
    idempotency_key: str

class RoomResponse(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    room_type: RoomType
    amenities: List[str]
    images: List[RoomImage]
    base_price: float
    max_occupancy: int
    bed_configuration: str
    room_size: str
    floor: str
    view: str
    cancellation_policy: CancellationPolicy
    available: bool = True

class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    status: BookingStatus
    payment_status: PaymentStatus
    guest_details: GuestDetails
    room_bookings: List[RoomBookingDetails]
    pricing: PricingBreakdown
    created_at: datetime
    hold_expires_at: Optional[datetime] = None

class PriceBreakdownResponse(BaseModel):
    subtotal: float
    gst: float
    service_charge: float
    discount_amount: float
    total_amount: float
    currency: str
    nights: int
    available: bool

# Aliases for backward compatibility
Room = RoomDB
RoomInventory = RoomInventoryDB
Booking = BookingDB
Payment = PaymentDB
PromoCode = PromoCodeDB
AuditLog = AuditLogDB
