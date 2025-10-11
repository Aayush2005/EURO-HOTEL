from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import date
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.booking import (
    RoomType, RoomSearchRequest, PriceCheckRequest, BookingHoldRequest,
    BookingConfirmRequest, RoomResponse, PriceBreakdownResponse, BookingResponse,
    Room, Booking, BookingStatus
)
from beanie.operators import And
from app.services.booking_service import BookingService
from app.auth import get_current_user, get_current_active_user
from app.models.user import User
import uuid
import logging

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api", tags=["booking"])

@router.get("/rooms", response_model=List[RoomResponse])
async def search_rooms(
    start_date: Optional[date] = Query(None, description="Check-in date"),
    end_date: Optional[date] = Query(None, description="Check-out date"),
    guests: int = Query(1, ge=1, le=10, description="Number of guests"),
    room_type: Optional[RoomType] = Query(None, description="Room type filter"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    skip: int = Query(0, ge=0, description="Skip records for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Limit records")
):
    """Search available rooms with filters"""
    try:
        # If dates are provided, validate them
        if start_date and end_date and start_date >= end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Check-out date must be after check-in date"
            )
        
        # If no dates provided, just return all rooms
        if not start_date or not end_date:
            # Simple room listing without availability check
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
            
            # Convert to response format
            room_responses = []
            for room in rooms:
                room_responses.append(RoomResponse(
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
            
            return room_responses[skip:skip + limit]
        
        # If dates are provided, use the booking service
        rooms = await BookingService.search_rooms(
            start_date=start_date,
            end_date=end_date,
            guests=guests,
            room_type=room_type,
            min_price=min_price,
            max_price=max_price
        )
        
        # Apply pagination
        return rooms[skip:skip + limit]
        
    except Exception as e:
        logger.error(f"Error searching rooms: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search rooms"
        )

@router.get("/rooms/{slug}", response_model=RoomResponse)
async def get_room_details(slug: str):
    """Get detailed room information by slug"""
    try:
        room = await Room.find_one(Room.slug == slug, Room.active == True)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        
        return RoomResponse(
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting room details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get room details"
        )

@router.post("/rooms/availability")
async def check_room_availability(
    room_id: str,
    start_date: date,
    end_date: date
):
    """Check availability for a specific room"""
    try:
        if start_date >= end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Check-out date must be after check-in date"
            )
        
        availability = await BookingService.get_room_availability(
            room_id, start_date, end_date
        )
        
        return availability
        
    except Exception as e:
        logger.error(f"Error checking availability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check availability"
        )

@router.post("/bookings/price-check", response_model=PriceBreakdownResponse)
@limiter.limit("10/minute")
async def check_booking_price(request: Request, price_request: PriceCheckRequest):
    """Calculate pricing for booking request"""
    try:
        pricing = await BookingService.calculate_pricing(price_request)
        return pricing
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error calculating price: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate pricing"
        )

@router.post("/bookings/hold")
@limiter.limit("5/minute")
async def create_booking_hold(
    request: Request, 
    hold_request: BookingHoldRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create a temporary booking hold"""
    try:
        # Generate idempotency key if not provided
        if not hold_request.idempotency_key:
            hold_request.idempotency_key = str(uuid.uuid4())
        
        # Set user_id if authenticated
        if current_user:
            # Update guest details with user info if not provided
            if not hold_request.guest_details.email:
                hold_request.guest_details.email = current_user.email
            if not hold_request.guest_details.phone:
                hold_request.guest_details.phone = current_user.phone
        
        result = await BookingService.create_booking_hold(hold_request)
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating booking hold: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create booking hold"
        )

@router.post("/bookings/confirm", response_model=BookingResponse)
async def confirm_booking(
    confirm_request: BookingConfirmRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Confirm a booking hold"""
    try:
        booking = await BookingService.confirm_booking(confirm_request)
        
        # Link booking to user if authenticated
        if current_user:
            booking_doc = await Booking.get(confirm_request.hold_token)
            if booking_doc:
                booking_doc.user_id = str(current_user.id)
                await booking_doc.save()
        
        return booking
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error confirming booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm booking"
        )

@router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    reason: str = "User cancelled",
    current_user: Optional[User] = Depends(get_current_user)
):
    """Cancel a booking"""
    try:
        # Check if user owns the booking (if authenticated)
        if current_user:
            booking = await Booking.get(booking_id)
            if booking and booking.user_id and booking.user_id != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to cancel this booking"
                )
        
        result = await BookingService.cancel_booking(booking_id, reason)
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel booking"
        )

@router.get("/bookings/{booking_id}", response_model=BookingResponse)
async def get_booking_details(
    booking_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get booking details"""
    try:
        booking = await Booking.get(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check if user owns the booking (if authenticated)
        if current_user and booking.user_id and booking.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this booking"
            )
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting booking details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get booking details"
        )

@router.get("/bookings", response_model=List[BookingResponse])
async def get_user_bookings(
    current_user: User = Depends(get_current_active_user),
    status_filter: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    skip: int = Query(0, ge=0, description="Skip records for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Limit records")
):
    """Get user's bookings"""
    try:
        query_conditions = [Booking.user_id == str(current_user.id)]
        
        if status_filter:
            query_conditions.append(Booking.status == status_filter)
        
        bookings = await Booking.find(
            *query_conditions
        ).sort(-Booking.created_at).skip(skip).limit(limit).to_list()
        
        return [
            BookingResponse(
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
            for booking in bookings
        ]
        
    except Exception as e:
        logger.error(f"Error getting user bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bookings"
        )