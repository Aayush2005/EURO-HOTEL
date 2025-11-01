from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
from beanie import PydanticObjectId
from beanie.operators import In, And, Or
from motor.motor_asyncio import AsyncIOMotorClientSession
import uuid
import asyncio

from app.models.booking import (
    Room, RoomInventory, Booking, Payment, PromoCode, AuditLog,
    BookingStatus, PaymentStatus, RoomType, CancellationPolicy,
    PriceCheckRequest, BookingHoldRequest, BookingConfirmRequest,
    PriceBreakdownResponse, BookingResponse, RoomResponse,
    RoomBookingDetails, PricingBreakdown
)
from app.config import settings

class BookingService:
    
    @staticmethod
    def calculate_nights(start_date: date, end_date: date) -> int:
        """Calculate number of nights between dates"""
        return (end_date - start_date).days
    
    @staticmethod
    def calculate_gst(amount: float) -> float:
        """Calculate 18% GST on amount"""
        return round(amount * 0.18, 2)
    
    @staticmethod
    def calculate_service_charge(amount: float) -> float:
        """Calculate 10% service charge on amount"""
        return round(amount * 0.10, 2)
    
    @staticmethod
    async def get_room_availability(
        room_id: str, 
        start_date: date, 
        end_date: date
    ) -> Dict[str, Any]:
        """Check room availability for date range"""
        try:
            room = await Room.get(PydanticObjectId(room_id))
        except Exception:
            room = None
        if not room or not room.active:
            return {"available": False, "reason": "Room not found or inactive"}
        
        # Get all dates in range
        current_date = start_date
        dates_to_check = []
        while current_date < end_date:
            dates_to_check.append(current_date)
            current_date += timedelta(days=1)
        
        # Check inventory for each date
        inventory_records = await RoomInventory.find(
            And(
                RoomInventory.room_id == room_id,
                In(RoomInventory.date, dates_to_check)
            )
        ).to_list()
        
        # Create inventory map
        inventory_map = {inv.date: inv for inv in inventory_records}
        
        # Check availability for each date
        total_rooms = room.metadata.get("total_rooms", 1)
        for check_date in dates_to_check:
            if check_date in inventory_map:
                inv = inventory_map[check_date]
                if inv.blocked_reason:
                    return {"available": False, "reason": f"Room blocked on {check_date}"}
                available = inv.available_count - inv.locked_count
                if available <= 0:
                    return {"available": False, "reason": f"No rooms available on {check_date}"}
            else:
                # No inventory record means all rooms available
                pass
        
        return {"available": True, "total_rooms": total_rooms}
    
    @staticmethod
    async def calculate_pricing(request: PriceCheckRequest) -> PriceBreakdownResponse:
        """Calculate detailed pricing for booking request"""
        try:
            room = await Room.get(PydanticObjectId(request.room_id))
        except Exception:
            room = None
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
        subtotal = room.base_price * nights
        
        # Apply promo code if provided
        discount_amount = 0
        if request.promo_code:
            promo = await PromoCode.find_one(
                And(
                    PromoCode.code == request.promo_code.upper(),
                    PromoCode.active == True,
                    PromoCode.valid_from <= datetime.utcnow(),
                    PromoCode.valid_until >= datetime.utcnow(),
                    PromoCode.used_count < PromoCode.usage_limit
                )
            )
            
            if promo and (
                "all" in promo.applicable_room_types or 
                room.room_type.value in promo.applicable_room_types
            ):
                if subtotal >= promo.min_amount:
                    if promo.discount_type == "percentage":
                        discount_amount = subtotal * (promo.discount_value / 100)
                        if promo.max_discount:
                            discount_amount = min(discount_amount, promo.max_discount)
                    else:
                        discount_amount = promo.discount_value
                    
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
        # Check if idempotency key already exists
        existing_booking = await Booking.find_one(
            Booking.idempotency_key == request.idempotency_key
        )
        if existing_booking:
            if existing_booking.hold_expires_at and existing_booking.hold_expires_at > datetime.utcnow():
                return {
                    "hold_token": str(existing_booking.id),
                    "expires_at": existing_booking.hold_expires_at,
                    "booking": BookingResponse.from_orm(existing_booking)
                }
            else:
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
        
        room_booking = RoomBookingDetails(
            room_id=request.room_id,
            start_date=request.start_date,
            end_date=request.end_date,
            nights=nights,
            base_price=pricing.subtotal / nights,
            final_price=pricing.subtotal
        )
        
        pricing_breakdown = PricingBreakdown(
            subtotal=pricing.subtotal,
            gst=pricing.gst,
            service_charge=pricing.service_charge,
            discount_amount=pricing.discount_amount,
            total_amount=pricing.total_amount,
            currency=pricing.currency
        )
        
        booking = Booking(
            user_id=None,  # Will be set if user is authenticated
            guest_details=request.guest_details,
            additional_guests=request.additional_guests,
            room_bookings=[room_booking],
            total_guests=request.guests,
            special_requests=request.special_requests,
            status=BookingStatus.PENDING,
            pricing=pricing_breakdown,
            payment_status=PaymentStatus.PENDING,
            idempotency_key=request.idempotency_key,
            hold_expires_at=hold_expires_at
        )
        
        # Use transaction to create booking and lock inventory
        async with await Booking.get_motor_client().start_session() as session:
            async with session.start_transaction():
                # Save booking
                await booking.insert(session=session)
                
                # Lock inventory for each date
                current_date = request.start_date
                while current_date < request.end_date:
                    # Get or create inventory record
                    inventory = await RoomInventory.find_one(
                        And(
                            RoomInventory.room_id == request.room_id,
                            RoomInventory.date == current_date
                        ),
                        session=session
                    )
                    
                    if inventory:
                        inventory.locked_count += 1
                        await inventory.save(session=session)
                    else:
                        # Create new inventory record
                        room = await Room.get(request.room_id, session=session)
                        total_rooms = room.metadata.get("total_rooms", 1)
                        
                        new_inventory = RoomInventory(
                            room_id=request.room_id,
                            date=current_date,
                            available_count=total_rooms,
                            locked_count=1
                        )
                        await new_inventory.insert(session=session)
                    
                    current_date += timedelta(days=1)
                
                # Log the action
                audit_log = AuditLog(
                    actor="system",
                    action="booking_hold_created",
                    resource="booking",
                    resource_id=str(booking.id),
                    after=booking.dict()
                )
                await audit_log.insert(session=session)
        
        return {
            "hold_token": str(booking.id),
            "expires_at": hold_expires_at,
            "booking": BookingResponse(
                id=str(booking.id),
                booking_reference=booking.booking_reference,
                status=booking.status,
                payment_status=booking.payment_status,
                guest_details=booking.guest_details,
                room_bookings=booking.room_bookings,
                pricing=booking.pricing,
                created_at=booking.created_at,
                hold_expires_at=booking.hold_expires_at
            )
        }
    
    @staticmethod
    async def confirm_booking(request: BookingConfirmRequest) -> BookingResponse:
        """Confirm a booking hold"""
        booking = await Booking.get(request.hold_token)
        if not booking:
            raise ValueError("Invalid hold token")
        
        if booking.idempotency_key != request.idempotency_key:
            raise ValueError("Invalid idempotency key")
        
        if booking.status != BookingStatus.PENDING:
            raise ValueError("Booking already processed")
        
        if booking.hold_expires_at and booking.hold_expires_at <= datetime.utcnow():
            raise ValueError("Hold expired")
        
        # Update booking status
        booking.status = BookingStatus.CONFIRMED
        booking.hold_expires_at = None
        booking.updated_at = datetime.utcnow()
        booking.version += 1
        
        await booking.save()
        
        # Log the confirmation
        audit_log = AuditLog(
            actor="system",
            action="booking_confirmed",
            resource="booking",
            resource_id=str(booking.id),
            after=booking.dict()
        )
        await audit_log.insert()
        
        return BookingResponse(
            id=str(booking.id),
            booking_reference=booking.booking_reference,
            status=booking.status,
            payment_status=booking.payment_status,
            guest_details=booking.guest_details,
            room_bookings=booking.room_bookings,
            pricing=booking.pricing,
            created_at=booking.created_at,
            hold_expires_at=booking.hold_expires_at
        )
    
    @staticmethod
    async def cancel_booking(booking_id: str, reason: str = "User cancelled") -> Dict[str, Any]:
        """Cancel a booking"""
        booking = await Booking.get(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        if booking.status in [BookingStatus.CANCELLED, BookingStatus.CHECKED_OUT]:
            raise ValueError("Booking already cancelled or completed")
        
        # Calculate refund based on cancellation policy
        refund_amount = 0
        room = await Room.get(booking.room_bookings[0].room_id)
        
        if room.cancellation_policy == CancellationPolicy.FREE_24H:
            # Free cancellation if more than 24 hours before check-in
            checkin_datetime = datetime.combine(booking.room_bookings[0].start_date, datetime.min.time())
            if datetime.utcnow() < checkin_datetime - timedelta(hours=24):
                refund_amount = booking.pricing.total_amount
        elif room.cancellation_policy == CancellationPolicy.FLEXIBLE:
            # 50% refund for flexible policy
            refund_amount = booking.pricing.total_amount * 0.5
        # Non-refundable = 0 refund
        
        # Update booking
        old_booking = booking.dict()
        booking.status = BookingStatus.CANCELLED
        booking.updated_at = datetime.utcnow()
        booking.version += 1
        
        await booking.save()
        
        # Release inventory
        for room_booking in booking.room_bookings:
            current_date = room_booking.start_date
            while current_date < room_booking.end_date:
                inventory = await RoomInventory.find_one(
                    And(
                        RoomInventory.room_id == room_booking.room_id,
                        RoomInventory.date == current_date
                    )
                )
                if inventory and inventory.locked_count > 0:
                    inventory.locked_count -= 1
                    await inventory.save()
                
                current_date += timedelta(days=1)
        
        # Log the cancellation
        audit_log = AuditLog(
            actor="system",
            action="booking_cancelled",
            resource="booking",
            resource_id=str(booking.id),
            before=old_booking,
            after=booking.dict()
        )
        await audit_log.insert()
        
        return {
            "booking_id": str(booking.id),
            "status": "cancelled",
            "refund_amount": refund_amount,
            "refund_eligible": refund_amount > 0
        }
    
    @staticmethod
    async def release_expired_holds():
        """Background task to release expired holds"""
        expired_bookings = await Booking.find(
            And(
                Booking.status == BookingStatus.PENDING,
                Booking.hold_expires_at <= datetime.utcnow()
            )
        ).to_list()
        
        for booking in expired_bookings:
            try:
                await BookingService.cancel_booking(str(booking.id), "Hold expired")
            except Exception as e:
                print(f"Error releasing expired hold {booking.id}: {e}")
    
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
        # Build query
        query_conditions = [Room.active == True]
        
        if room_type:
            query_conditions.append(Room.room_type == room_type)
        
        if min_price:
            query_conditions.append(Room.base_price >= min_price)
        
        if max_price:
            query_conditions.append(Room.base_price <= max_price)
        
        # Filter by occupancy
        query_conditions.append(Room.max_occupancy >= guests)
        
        if len(query_conditions) > 1:
            rooms = await Room.find(And(*query_conditions)).to_list()
        else:
            rooms = await Room.find(query_conditions[0]).to_list()
        
        # Check availability for each room
        available_rooms = []
        for room in rooms:
            availability = await BookingService.get_room_availability(
                str(room.id), start_date, end_date
            )
            
            if availability["available"]:
                available_rooms.append(RoomResponse(
                    id=str(room.id),
                    slug=room.slug,
                    title=room.title,
                    description=room.description,
                    room_type=room.room_type,
                    amenities=room.amenities,
                    images=room.images,
                    base_price=room.base_price,
                    max_occupancy=room.max_occupancy,
                    bed_configuration=room.bed_configuration,
                    room_size=room.room_size,
                    floor=room.floor,
                    view=room.view,
                    cancellation_policy=room.cancellation_policy,
                    available=True
                ))
        
        return available_rooms