from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from beanie.operators import And, Or, In

from app.models.booking import (
    Room, RoomInventory, Booking, Payment, PromoCode, AuditLog,
    BookingStatus, PaymentStatus, RoomType, CancellationPolicy,
    RoomResponse, BookingResponse, RoomImage
)
from app.auth import get_current_active_user
from app.models.user import User
from app.services.booking_service import BookingService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Admin dependency (in production, add proper admin role check)
async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    # TODO: Add proper admin role check
    return current_user

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    admin_user: User = Depends(get_admin_user),
    status_filter: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    payment_status_filter: Optional[PaymentStatus] = Query(None, description="Filter by payment status"),
    start_date: Optional[date] = Query(None, description="Filter bookings from this date"),
    end_date: Optional[date] = Query(None, description="Filter bookings until this date"),
    guest_email: Optional[str] = Query(None, description="Filter by guest email"),
    booking_reference: Optional[str] = Query(None, description="Filter by booking reference"),
    skip: int = Query(0, ge=0, description="Skip records for pagination"),
    limit: int = Query(50, ge=1, le=200, description="Limit records")
):
    """Get all bookings with filters (Admin only)"""
    try:
        query_conditions = []
        
        if status_filter:
            query_conditions.append(Booking.status == status_filter)
        
        if payment_status_filter:
            query_conditions.append(Booking.payment_status == payment_status_filter)
        
        if start_date:
            query_conditions.append(Booking.created_at >= datetime.combine(start_date, datetime.min.time()))
        
        if end_date:
            query_conditions.append(Booking.created_at <= datetime.combine(end_date, datetime.max.time()))
        
        if guest_email:
            query_conditions.append(Booking.guest_details.email == guest_email)
        
        if booking_reference:
            query_conditions.append(Booking.booking_reference == booking_reference)
        
        if query_conditions:
            bookings = await Booking.find(And(*query_conditions))
        else:
            bookings = await Booking.find()
        
        bookings = await bookings.sort(-Booking.created_at).skip(skip).limit(limit).to_list()
        
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
        logger.error(f"Error getting admin bookings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bookings"
        )

@router.put("/bookings/{booking_id}")
async def update_booking_status(
    booking_id: str,
    new_status: BookingStatus,
    admin_user: User = Depends(get_admin_user)
):
    """Update booking status (Admin only)"""
    try:
        booking = await Booking.get(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        old_status = booking.status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        booking.version += 1
        
        await booking.save()
        
        # Log the action
        audit_log = AuditLog(
            actor=str(admin_user.id),
            action="booking_status_updated",
            resource="booking",
            resource_id=str(booking.id),
            before={"status": old_status.value},
            after={"status": new_status.value}
        )
        await audit_log.insert()
        
        return {
            "success": True,
            "booking_id": booking_id,
            "old_status": old_status.value,
            "new_status": new_status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update booking status"
        )

@router.put("/bookings/{booking_id}/check-in")
async def check_in_booking(
    booking_id: str,
    room_number: str,
    admin_user: User = Depends(get_admin_user)
):
    """Check in a booking (Admin only)"""
    try:
        booking = await Booking.get(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        if booking.status != BookingStatus.CONFIRMED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking must be confirmed to check in"
            )
        
        if booking.payment_status != PaymentStatus.PAID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment must be completed to check in"
            )
        
        # Update booking status and room number
        booking.status = BookingStatus.CHECKED_IN
        booking.room_bookings[0].room_number = room_number
        booking.updated_at = datetime.utcnow()
        booking.version += 1
        
        await booking.save()
        
        # Log the action
        audit_log = AuditLog(
            actor=str(admin_user.id),
            action="booking_checked_in",
            resource="booking",
            resource_id=str(booking.id),
            after={"room_number": room_number, "status": "checked_in"}
        )
        await audit_log.insert()
        
        return {
            "success": True,
            "booking_id": booking_id,
            "room_number": room_number,
            "status": "checked_in"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking in booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check in booking"
        )

@router.put("/bookings/{booking_id}/check-out")
async def check_out_booking(
    booking_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Check out a booking (Admin only)"""
    try:
        booking = await Booking.get(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        if booking.status != BookingStatus.CHECKED_IN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking must be checked in to check out"
            )
        
        # Update booking status
        booking.status = BookingStatus.CHECKED_OUT
        booking.updated_at = datetime.utcnow()
        booking.version += 1
        
        await booking.save()
        
        # Log the action
        audit_log = AuditLog(
            actor=str(admin_user.id),
            action="booking_checked_out",
            resource="booking",
            resource_id=str(booking.id),
            after={"status": "checked_out"}
        )
        await audit_log.insert()
        
        return {
            "success": True,
            "booking_id": booking_id,
            "status": "checked_out"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking out booking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check out booking"
        )

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    start_date: Optional[date] = Query(None, description="Stats from this date"),
    end_date: Optional[date] = Query(None, description="Stats until this date")
):
    """Get dashboard statistics (Admin only)"""
    try:
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Get bookings in date range
        bookings = await Booking.find(
            And(
                Booking.created_at >= start_datetime,
                Booking.created_at <= end_datetime
            )
        ).to_list()
        
        # Calculate stats
        total_bookings = len(bookings)
        confirmed_bookings = len([b for b in bookings if b.status == BookingStatus.CONFIRMED])
        cancelled_bookings = len([b for b in bookings if b.status == BookingStatus.CANCELLED])
        checked_in_bookings = len([b for b in bookings if b.status == BookingStatus.CHECKED_IN])
        checked_out_bookings = len([b for b in bookings if b.status == BookingStatus.CHECKED_OUT])
        
        total_revenue = sum([b.pricing.total_amount for b in bookings if b.payment_status == PaymentStatus.PAID])
        pending_revenue = sum([b.pricing.total_amount for b in bookings if b.payment_status == PaymentStatus.PENDING])
        
        # Room type breakdown
        room_type_stats = {}
        for booking in bookings:
            for room_booking in booking.room_bookings:
                room = await Room.get(room_booking.room_id)
                if room:
                    room_type = room.room_type.value
                    if room_type not in room_type_stats:
                        room_type_stats[room_type] = {"count": 0, "revenue": 0}
                    room_type_stats[room_type]["count"] += 1
                    if booking.payment_status == PaymentStatus.PAID:
                        room_type_stats[room_type]["revenue"] += booking.pricing.total_amount
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "bookings": {
                "total": total_bookings,
                "confirmed": confirmed_bookings,
                "cancelled": cancelled_bookings,
                "checked_in": checked_in_bookings,
                "checked_out": checked_out_bookings
            },
            "revenue": {
                "total": total_revenue,
                "pending": pending_revenue,
                "currency": "INR"
            },
            "room_types": room_type_stats
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard stats"
        )

@router.post("/rooms/{room_id}/block")
async def block_room_dates(
    room_id: str,
    start_date: date,
    end_date: date,
    reason: str,
    admin_user: User = Depends(get_admin_user)
):
    """Block room dates for maintenance or events (Admin only)"""
    try:
        room = await Room.get(room_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found"
            )
        
        if start_date >= end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )
        
        # Block each date in the range
        current_date = start_date
        blocked_dates = []
        
        while current_date < end_date:
            # Get or create inventory record
            inventory = await RoomInventory.find_one(
                And(
                    RoomInventory.room_id == room_id,
                    RoomInventory.date == current_date
                )
            )
            
            if inventory:
                inventory.blocked_reason = reason
                inventory.available_count = 0
                await inventory.save()
            else:
                new_inventory = RoomInventory(
                    room_id=room_id,
                    date=current_date,
                    available_count=0,
                    blocked_reason=reason
                )
                await new_inventory.insert()
            
            blocked_dates.append(current_date.isoformat())
            current_date += timedelta(days=1)
        
        # Log the action
        audit_log = AuditLog(
            actor=str(admin_user.id),
            action="room_dates_blocked",
            resource="room",
            resource_id=room_id,
            after={
                "blocked_dates": blocked_dates,
                "reason": reason
            }
        )
        await audit_log.insert()
        
        return {
            "success": True,
            "room_id": room_id,
            "blocked_dates": blocked_dates,
            "reason": reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error blocking room dates: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to block room dates"
        )

@router.post("/promo")
async def create_promo_code(
    code: str,
    discount_type: str,
    discount_value: float,
    min_amount: float = 0,
    max_discount: Optional[float] = None,
    valid_from: datetime = None,
    valid_until: datetime = None,
    usage_limit: int = 100,
    applicable_room_types: List[str] = ["all"],
    admin_user: User = Depends(get_admin_user)
):
    """Create a new promo code (Admin only)"""
    try:
        if not valid_from:
            valid_from = datetime.utcnow()
        if not valid_until:
            valid_until = datetime.utcnow() + timedelta(days=30)
        
        # Check if promo code already exists
        existing_promo = await PromoCode.find_one(PromoCode.code == code.upper())
        if existing_promo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Promo code already exists"
            )
        
        promo = PromoCode(
            code=code.upper(),
            discount_type=discount_type,
            discount_value=discount_value,
            min_amount=min_amount,
            max_discount=max_discount,
            valid_from=valid_from,
            valid_until=valid_until,
            usage_limit=usage_limit,
            applicable_room_types=applicable_room_types
        )
        
        await promo.insert()
        
        # Log the action
        audit_log = AuditLog(
            actor=str(admin_user.id),
            action="promo_code_created",
            resource="promo_code",
            resource_id=str(promo.id),
            after=promo.dict()
        )
        await audit_log.insert()
        
        return {
            "success": True,
            "promo_code": {
                "id": str(promo.id),
                "code": promo.code,
                "discount_type": promo.discount_type,
                "discount_value": promo.discount_value,
                "valid_from": promo.valid_from,
                "valid_until": promo.valid_until
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating promo code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create promo code"
        )