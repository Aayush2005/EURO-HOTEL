from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
import uuid

from app.models.booking import (
    RoomDB, BookingDB, PaymentDB, PromoCodeDB, AuditLogDB,
    BookingStatus, PaymentStatus, RoomType, CancellationPolicy,
    PriceCheckRequest, BookingHoldRequest, BookingConfirmRequest,
    PriceBreakdownResponse, BookingResponse, RoomResponse,
    RoomBookingDetails, PricingBreakdown, GuestDetails
)
from app.database import get_supabase
from app.config import settings
from app.hotel_config import ADDITIONAL_CHARGES

class BookingService:
    
    @staticmethod
    def calculate_nights(start_date: date, end_date: date) -> int:
        """Calculate number of nights between dates"""
        return (end_date - start_date).days
    
    @staticmethod
    def calculate_gst(amount: float) -> float:
        """Calculate GST based on Euro Hotel policy: 5% for rooms under ₹7500"""
        gst_threshold = ADDITIONAL_CHARGES["gst_threshold"]
        if amount < gst_threshold:
            return round(amount * ADDITIONAL_CHARGES["gst_rate_under_threshold"], 2)
        else:
            return round(amount * ADDITIONAL_CHARGES["gst_rate_over_threshold"], 2)
    
    @staticmethod
    def calculate_service_charge(amount: float) -> float:
        """No service charge for Euro Hotel - keeping for future use"""
        return 0.0
    
    @staticmethod
    async def get_room_by_id(room_id: str) -> Optional[Dict]:
        """Get room by ID"""
        supabase = get_supabase()
        result = supabase.table("rooms").select("*").eq("id", room_id).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    async def get_room_availability(
        room_id: str, 
        start_date: date, 
        end_date: date
    ) -> Dict[str, Any]:
        """Check room availability for date range"""
        supabase = get_supabase()
        
        room = await BookingService.get_room_by_id(room_id)
        if not room or not room.get("active", True):
            return {"available": False, "reason": "Room not found or inactive"}
        
        # Get all dates in range
        current_date = start_date
        dates_to_check = []
        while current_date < end_date:
            dates_to_check.append(current_date.isoformat())
            current_date += timedelta(days=1)
        
        # Check inventory for each date
        inventory_result = supabase.table("room_inventory").select("*").eq("room_id", room_id).in_("date", dates_to_check).execute()
        
        # Create inventory map
        inventory_map = {inv["date"]: inv for inv in inventory_result.data}
        
        # Check availability for each date
        total_rooms = room.get("room_metadata", {}).get("total_rooms", 1)
        for check_date in dates_to_check:
            if check_date in inventory_map:
                inv = inventory_map[check_date]
                if inv.get("blocked_reason"):
                    return {"available": False, "reason": f"Room blocked on {check_date}"}
                available = inv["available_count"] - inv.get("locked_count", 0)
                if available <= 0:
                    return {"available": False, "reason": f"No rooms available on {check_date}"}
        
        return {"available": True, "total_rooms": total_rooms}
    
    @staticmethod
    async def calculate_pricing(request: PriceCheckRequest) -> PriceBreakdownResponse:
        """Calculate detailed pricing for booking request"""
        room = await BookingService.get_room_by_id(request.room_id)
        if not room:
            raise ValueError("Room not found")
        
        nights = BookingService.calculate_nights(request.start_date, request.end_date)
        if nights <= 0:
            raise ValueError("Invalid date range")
        
        # Check availability
        availability = await BookingService.get_room_availability(
            request.room_id, request.start_date, request.end_date
        )
        
        if not availability["available"]:
            return PriceBreakdownResponse(
                subtotal=0,
                gst=0,
                service_charge=0,
                discount_amount=0,
                total_amount=0,
                currency="INR",
                nights=nights,
                available=False
            )
        
        # Calculate base price
        subtotal = room["base_price"] * nights
        
        # Apply promo code if provided
        discount_amount = 0
        if request.promo_code:
            supabase = get_supabase()
            now = datetime.utcnow().isoformat()
            promo_result = supabase.table("promo_codes").select("*").eq("code", request.promo_code.upper()).eq("active", True).lte("valid_from", now).gte("valid_until", now).execute()
            
            if promo_result.data:
                promo = promo_result.data[0]
                if promo["used_count"] < promo["usage_limit"]:
                    applicable_types = promo.get("applicable_room_types", ["all"])
                    if "all" in applicable_types or room["room_type"] in applicable_types:
                        if subtotal >= promo.get("min_amount", 0):
                            if promo["discount_type"] == "percentage":
                                discount_amount = subtotal * (promo["discount_value"] / 100)
                                if promo.get("max_discount"):
                                    discount_amount = min(discount_amount, promo["max_discount"])
                            else:
                                discount_amount = promo["discount_value"]
                            
                            discount_amount = round(discount_amount, 2)
        
        # Calculate final amounts
        discounted_subtotal = subtotal - discount_amount
        gst = BookingService.calculate_gst(discounted_subtotal)
        service_charge = BookingService.calculate_service_charge(discounted_subtotal)
        total_amount = discounted_subtotal + gst + service_charge
        
        return PriceBreakdownResponse(
            subtotal=subtotal,
            gst=gst,
            service_charge=service_charge,
            discount_amount=discount_amount,
            total_amount=total_amount,
            currency="INR",
            nights=nights,
            available=True
        )
    
    @staticmethod
    async def create_booking_hold(request: BookingHoldRequest) -> Dict[str, Any]:
        """Create a temporary booking hold"""
        supabase = get_supabase()
        
        # Check if idempotency key already exists
        existing_result = supabase.table("bookings").select("*").eq("idempotency_key", request.idempotency_key).execute()
        
        if existing_result.data:
            existing_booking = existing_result.data[0]
            hold_expires = existing_booking.get("hold_expires_at")
            if hold_expires:
                hold_expires_dt = datetime.fromisoformat(hold_expires.replace("Z", "+00:00").replace("+00:00", ""))
                if hold_expires_dt > datetime.utcnow():
                    return {
                        "hold_token": existing_booking["id"],
                        "expires_at": hold_expires,
                        "booking": BookingResponse(
                            id=existing_booking["id"],
                            booking_reference=existing_booking["booking_reference"],
                            status=BookingStatus(existing_booking["status"]),
                            payment_status=PaymentStatus(existing_booking["payment_status"]),
                            guest_details=GuestDetails(**existing_booking["guest_details"]),
                            room_bookings=[RoomBookingDetails(**rb) for rb in existing_booking["room_bookings"]],
                            pricing=PricingBreakdown(**existing_booking["pricing"]),
                            created_at=datetime.fromisoformat(existing_booking["created_at"].replace("Z", "")),
                            hold_expires_at=hold_expires_dt
                        )
                    }
            raise ValueError("Hold expired or booking already processed")
        
        # Calculate pricing
        price_request = PriceCheckRequest(
            room_id=request.room_id,
            start_date=request.start_date,
            end_date=request.end_date,
            guests=request.guests,
            promo_code=request.promo_code
        )
        pricing = await BookingService.calculate_pricing(price_request)
        
        if not pricing.available:
            raise ValueError("Room not available for selected dates")
        
        # Create booking with hold
        hold_expires_at = datetime.utcnow() + timedelta(minutes=15)
        nights = BookingService.calculate_nights(request.start_date, request.end_date)
        booking_id = str(uuid.uuid4())
        booking_reference = f"EH{datetime.now().year}{uuid.uuid4().hex[:8].upper()}"
        now = datetime.utcnow().isoformat()
        
        room_booking = {
            "room_id": request.room_id,
            "room_number": None,
            "start_date": request.start_date.isoformat(),
            "end_date": request.end_date.isoformat(),
            "nights": nights,
            "base_price": pricing.subtotal / nights,
            "final_price": pricing.subtotal
        }
        
        pricing_breakdown = {
            "subtotal": pricing.subtotal,
            "gst": pricing.gst,
            "service_charge": pricing.service_charge,
            "discount_amount": pricing.discount_amount,
            "total_amount": pricing.total_amount,
            "currency": pricing.currency
        }
        
        booking_data = {
            "id": booking_id,
            "booking_reference": booking_reference,
            "user_id": None,
            "guest_details": request.guest_details.dict(),
            "additional_guests": [g.dict() for g in request.additional_guests],
            "room_bookings": [room_booking],
            "total_guests": request.guests,
            "special_requests": request.special_requests,
            "status": BookingStatus.PENDING.value,
            "pricing": pricing_breakdown,
            "payment_status": PaymentStatus.PENDING.value,
            "idempotency_key": request.idempotency_key,
            "hold_expires_at": hold_expires_at.isoformat(),
            "check_in_time": "14:00",
            "check_out_time": "12:00",
            "version": 1,
            "created_at": now,
            "updated_at": now
        }
        
        # Save booking
        result = supabase.table("bookings").insert(booking_data).execute()
        
        if not result.data:
            raise ValueError("Failed to create booking")
        
        # Lock inventory for each date
        current_date = request.start_date
        room = await BookingService.get_room_by_id(request.room_id)
        total_rooms = room.get("room_metadata", {}).get("total_rooms", 1) if room else 1
        
        while current_date < request.end_date:
            date_str = current_date.isoformat()
            
            # Check if inventory exists
            inv_result = supabase.table("room_inventory").select("*").eq("room_id", request.room_id).eq("date", date_str).execute()
            
            if inv_result.data:
                # Update existing inventory
                inv = inv_result.data[0]
                supabase.table("room_inventory").update({
                    "locked_count": inv.get("locked_count", 0) + 1,
                    "updated_at": now
                }).eq("id", inv["id"]).execute()
            else:
                # Create new inventory record
                supabase.table("room_inventory").insert({
                    "id": str(uuid.uuid4()),
                    "room_id": request.room_id,
                    "date": date_str,
                    "available_count": total_rooms,
                    "locked_count": 1,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            
            current_date += timedelta(days=1)
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": "system",
            "action": "booking_hold_created",
            "resource": "booking",
            "resource_id": booking_id,
            "after": booking_data,
            "timestamp": now
        }).execute()
        
        return {
            "hold_token": booking_id,
            "expires_at": hold_expires_at.isoformat() + "Z",
            "booking": BookingResponse(
                id=booking_id,
                booking_reference=booking_reference,
                status=BookingStatus.PENDING,
                payment_status=PaymentStatus.PENDING,
                guest_details=request.guest_details,
                room_bookings=[RoomBookingDetails(**room_booking)],
                pricing=PricingBreakdown(**pricing_breakdown),
                created_at=datetime.fromisoformat(now),
                hold_expires_at=hold_expires_at
            )
        }
    
    @staticmethod
    async def confirm_booking(request: BookingConfirmRequest) -> BookingResponse:
        """Confirm a booking hold"""
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", request.hold_token).execute()
        if not result.data:
            raise ValueError("Invalid hold token")
        
        booking = result.data[0]
        
        if booking["idempotency_key"] != request.idempotency_key:
            raise ValueError("Invalid idempotency key")
        
        if booking["status"] != BookingStatus.PENDING.value:
            raise ValueError("Booking already processed")
        
        hold_expires = booking.get("hold_expires_at")
        if hold_expires:
            hold_expires_dt = datetime.fromisoformat(hold_expires.replace("Z", "+00:00").replace("+00:00", ""))
            if hold_expires_dt <= datetime.utcnow():
                raise ValueError("Hold expired")
        
        # Update booking status
        now = datetime.utcnow().isoformat()
        supabase.table("bookings").update({
            "status": BookingStatus.CONFIRMED.value,
            "hold_expires_at": None,
            "updated_at": now,
            "version": booking["version"] + 1
        }).eq("id", request.hold_token).execute()
        
        # Log the confirmation
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": "system",
            "action": "booking_confirmed",
            "resource": "booking",
            "resource_id": request.hold_token,
            "before": {"status": booking["status"]},
            "after": {"status": BookingStatus.CONFIRMED.value},
            "timestamp": now
        }).execute()
        
        return BookingResponse(
            id=booking["id"],
            booking_reference=booking["booking_reference"],
            status=BookingStatus.CONFIRMED,
            payment_status=PaymentStatus(booking["payment_status"]),
            guest_details=GuestDetails(**booking["guest_details"]),
            room_bookings=[RoomBookingDetails(**rb) for rb in booking["room_bookings"]],
            pricing=PricingBreakdown(**booking["pricing"]),
            created_at=datetime.fromisoformat(booking["created_at"].replace("Z", "")),
            hold_expires_at=None
        )
    
    @staticmethod
    async def cancel_booking(booking_id: str, reason: str = "User cancelled") -> Dict[str, Any]:
        """Cancel a booking"""
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()
        if not result.data:
            raise ValueError("Booking not found")
        
        booking = result.data[0]
        
        if booking["status"] in [BookingStatus.CANCELLED.value, BookingStatus.CHECKED_OUT.value]:
            raise ValueError("Booking already cancelled or completed")
        
        # Calculate refund based on cancellation policy
        refund_amount = 0
        room_booking = booking["room_bookings"][0]
        room = await BookingService.get_room_by_id(room_booking["room_id"])
        
        if room:
            cancellation_policy = room.get("cancellation_policy", "free_48h")
            pricing = booking["pricing"]
            
            if cancellation_policy == CancellationPolicy.FREE_48H.value:
                checkin_date = datetime.fromisoformat(room_booking["start_date"])
                if datetime.utcnow() < checkin_date - timedelta(hours=48):
                    refund_amount = pricing["total_amount"]
            elif cancellation_policy == CancellationPolicy.FLEXIBLE.value:
                refund_amount = pricing["total_amount"] * 0.5
        
        # Update booking
        now = datetime.utcnow().isoformat()
        supabase.table("bookings").update({
            "status": BookingStatus.CANCELLED.value,
            "updated_at": now,
            "version": booking["version"] + 1
        }).eq("id", booking_id).execute()
        
        # Release inventory
        for rb in booking["room_bookings"]:
            start_date = datetime.fromisoformat(rb["start_date"]).date()
            end_date = datetime.fromisoformat(rb["end_date"]).date()
            current_date = start_date
            
            while current_date < end_date:
                date_str = current_date.isoformat()
                inv_result = supabase.table("room_inventory").select("*").eq("room_id", rb["room_id"]).eq("date", date_str).execute()
                
                if inv_result.data and inv_result.data[0].get("locked_count", 0) > 0:
                    inv = inv_result.data[0]
                    supabase.table("room_inventory").update({
                        "locked_count": max(0, inv["locked_count"] - 1),
                        "updated_at": now
                    }).eq("id", inv["id"]).execute()
                
                current_date += timedelta(days=1)
        
        # Log the cancellation
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": "system",
            "action": "booking_cancelled",
            "resource": "booking",
            "resource_id": booking_id,
            "before": {"status": booking["status"]},
            "after": {"status": BookingStatus.CANCELLED.value, "reason": reason},
            "timestamp": now
        }).execute()
        
        return {
            "booking_id": booking_id,
            "status": "cancelled",
            "refund_amount": refund_amount,
            "refund_eligible": refund_amount > 0
        }
    
    @staticmethod
    async def release_expired_holds():
        """Background task to release expired holds"""
        supabase = get_supabase()
        now = datetime.utcnow().isoformat()
        
        expired_result = supabase.table("bookings").select("id").eq("status", BookingStatus.PENDING.value).lt("hold_expires_at", now).execute()
        
        for booking in expired_result.data:
            try:
                await BookingService.cancel_booking(booking["id"], "Hold expired")
            except Exception as e:
                print(f"Error releasing expired hold {booking['id']}: {e}")
    
    @staticmethod
    async def search_rooms(
        start_date: date,
        end_date: date,
        guests: int = 1,
        room_type: Optional[RoomType] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[RoomResponse]:
        """Search available rooms"""
        supabase = get_supabase()
        
        # Build query
        query = supabase.table("rooms").select("*").eq("active", True).gte("max_occupancy", guests)
        
        if room_type:
            query = query.eq("room_type", room_type.value)
        
        if min_price:
            query = query.gte("base_price", min_price)
        
        if max_price:
            query = query.lte("base_price", max_price)
        
        result = query.execute()
        
        # Check availability for each room
        available_rooms = []
        for room in result.data:
            availability = await BookingService.get_room_availability(
                room["id"], start_date, end_date
            )
            
            if availability["available"]:
                available_rooms.append(RoomResponse(
                    id=room["id"],
                    slug=room["slug"],
                    title=room["title"],
                    description=room["description"],
                    room_type=RoomType(room["room_type"]),
                    amenities=room.get("amenities", []),
                    images=room.get("images", []),
                    base_price=room["base_price"],
                    max_occupancy=room["max_occupancy"],
                    bed_configuration=room["bed_configuration"],
                    room_size=room["room_size"],
                    floor=room["floor"],
                    view=room["view"],
                    cancellation_policy=CancellationPolicy(room["cancellation_policy"]),
                    available=True
                ))
        
        return available_rooms
