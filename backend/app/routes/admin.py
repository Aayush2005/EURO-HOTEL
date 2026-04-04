from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta

from app.models.booking import (
    RoomDB, BookingDB, PaymentDB, PromoCodeDB, AuditLogDB,
    BookingStatus, PaymentStatus, RoomType, CancellationPolicy,
    RoomResponse, BookingResponse, GuestDetails, RoomBookingDetails, PricingBreakdown
)
from app.database import get_supabase
from app.auth import get_current_active_user
from app.models.user import UserDB
from app.services.booking_service import BookingService
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

async def get_admin_user(current_user: UserDB = Depends(get_current_active_user)) -> UserDB:
    return current_user

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    admin_user: UserDB = Depends(get_admin_user),
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
        supabase = get_supabase()
        
        query = supabase.table("bookings").select("*").order("created_at", desc=True)
        
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        if payment_status_filter:
            query = query.eq("payment_status", payment_status_filter.value)
        
        if start_date:
            query = query.gte("created_at", datetime.combine(start_date, datetime.min.time()).isoformat())
        
        if end_date:
            query = query.lte("created_at", datetime.combine(end_date, datetime.max.time()).isoformat())
        
        if booking_reference:
            query = query.eq("booking_reference", booking_reference)
        
        result = query.range(skip, skip + limit - 1).execute()
        
        # Filter by guest email in Python (Supabase doesn't easily query JSONB fields)
        bookings_data = result.data
        if guest_email:
            bookings_data = [b for b in bookings_data if b.get("guest_details", {}).get("email") == guest_email]
        
        return [
            BookingResponse(
                id=booking["id"],
                booking_reference=booking["booking_reference"],
                status=BookingStatus(booking["status"]),
                payment_status=booking["payment_status"],
                guest_details=GuestDetails(**booking["guest_details"]),
                room_bookings=[RoomBookingDetails(**rb) for rb in booking["room_bookings"]],
                pricing=PricingBreakdown(**booking["pricing"]),
                created_at=datetime.fromisoformat(booking["created_at"].replace("Z", "")),
                hold_expires_at=datetime.fromisoformat(booking["hold_expires_at"].replace("Z", "")) if booking.get("hold_expires_at") else None
            )
            for booking in bookings_data
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
    admin_user: UserDB = Depends(get_admin_user)
):
    """Update booking status (Admin only)"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data[0]
        old_status = booking["status"]
        now = datetime.utcnow().isoformat()
        
        supabase.table("bookings").update({
            "status": new_status.value,
            "updated_at": now,
            "version": booking["version"] + 1
        }).eq("id", booking_id).execute()
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": str(admin_user.id),
            "action": "booking_status_updated",
            "resource": "booking",
            "resource_id": booking_id,
            "before": {"status": old_status},
            "after": {"status": new_status.value},
            "timestamp": now
        }).execute()
        
        return {
            "success": True,
            "booking_id": booking_id,
            "old_status": old_status,
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
    admin_user: UserDB = Depends(get_admin_user)
):
    """Check in a booking (Admin only)"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data[0]
        
        if booking["status"] != BookingStatus.CONFIRMED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking must be confirmed to check in"
            )
        
        if booking["payment_status"] != PaymentStatus.PAID.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment must be completed to check in"
            )
        
        # Update room number in room_bookings
        room_bookings = booking["room_bookings"]
        room_bookings[0]["room_number"] = room_number
        
        now = datetime.utcnow().isoformat()
        supabase.table("bookings").update({
            "status": BookingStatus.CHECKED_IN.value,
            "room_bookings": room_bookings,
            "updated_at": now,
            "version": booking["version"] + 1
        }).eq("id", booking_id).execute()
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": str(admin_user.id),
            "action": "booking_checked_in",
            "resource": "booking",
            "resource_id": booking_id,
            "after": {"room_number": room_number, "status": "checked_in"},
            "timestamp": now
        }).execute()
        
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
    admin_user: UserDB = Depends(get_admin_user)
):
    """Check out a booking (Admin only)"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        booking = result.data[0]
        
        if booking["status"] != BookingStatus.CHECKED_IN.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking must be checked in to check out"
            )
        
        now = datetime.utcnow().isoformat()
        
        # Release inventory for the booking dates
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
        
        supabase.table("bookings").update({
            "status": BookingStatus.CHECKED_OUT.value,
            "updated_at": now,
            "version": booking["version"] + 1
        }).eq("id", booking_id).execute()
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": str(admin_user.id),
            "action": "booking_checked_out",
            "resource": "booking",
            "resource_id": booking_id,
            "after": {"status": "checked_out"},
            "timestamp": now
        }).execute()
        
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
    admin_user: UserDB = Depends(get_admin_user),
    start_date: Optional[date] = Query(None, description="Stats from this date"),
    end_date: Optional[date] = Query(None, description="Stats until this date")
):
    """Get dashboard statistics (Admin only)"""
    try:
        supabase = get_supabase()
        
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        start_datetime = datetime.combine(start_date, datetime.min.time()).isoformat()
        end_datetime = datetime.combine(end_date, datetime.max.time()).isoformat()
        
        # Get bookings in date range
        result = supabase.table("bookings").select("*").gte("created_at", start_datetime).lte("created_at", end_datetime).execute()
        bookings = result.data
        
        # Calculate stats
        total_bookings = len(bookings)
        confirmed_bookings = len([b for b in bookings if b["status"] == BookingStatus.CONFIRMED.value])
        cancelled_bookings = len([b for b in bookings if b["status"] == BookingStatus.CANCELLED.value])
        checked_in_bookings = len([b for b in bookings if b["status"] == BookingStatus.CHECKED_IN.value])
        checked_out_bookings = len([b for b in bookings if b["status"] == BookingStatus.CHECKED_OUT.value])
        
        total_revenue = sum([b["pricing"]["total_amount"] for b in bookings if b["payment_status"] == PaymentStatus.PAID.value])
        pending_revenue = sum([b["pricing"]["total_amount"] for b in bookings if b["payment_status"] == PaymentStatus.PENDING.value])
        
        # Room type breakdown
        room_type_stats = {}
        rooms_cache = {}
        
        for booking in bookings:
            for room_booking in booking["room_bookings"]:
                room_id = room_booking["room_id"]
                
                # Get room from cache or fetch
                if room_id not in rooms_cache:
                    room_result = supabase.table("rooms").select("room_type").eq("id", room_id).execute()
                    rooms_cache[room_id] = room_result.data[0] if room_result.data else None
                
                room = rooms_cache[room_id]
                if room:
                    room_type = room["room_type"]
                    if room_type not in room_type_stats:
                        room_type_stats[room_type] = {"count": 0, "revenue": 0}
                    room_type_stats[room_type]["count"] += 1
                    if booking["payment_status"] == PaymentStatus.PAID.value:
                        room_type_stats[room_type]["revenue"] += booking["pricing"]["total_amount"]
        
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
    admin_user: UserDB = Depends(get_admin_user)
):
    """Block room dates for maintenance or events (Admin only)"""
    try:
        supabase = get_supabase()
        
        room_result = supabase.table("rooms").select("id").eq("id", room_id).execute()
        if not room_result.data:
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
        now = datetime.utcnow().isoformat()
        
        while current_date < end_date:
            date_str = current_date.isoformat()
            
            # Check if inventory exists
            inv_result = supabase.table("room_inventory").select("*").eq("room_id", room_id).eq("date", date_str).execute()
            
            if inv_result.data:
                # Update existing inventory
                supabase.table("room_inventory").update({
                    "blocked_reason": reason,
                    "available_count": 0,
                    "updated_at": now
                }).eq("id", inv_result.data[0]["id"]).execute()
            else:
                # Create new inventory record
                supabase.table("room_inventory").insert({
                    "id": str(uuid.uuid4()),
                    "room_id": room_id,
                    "date": date_str,
                    "available_count": 0,
                    "locked_count": 0,
                    "blocked_reason": reason,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            
            blocked_dates.append(date_str)
            current_date += timedelta(days=1)
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": str(admin_user.id),
            "action": "room_dates_blocked",
            "resource": "room",
            "resource_id": room_id,
            "after": {"blocked_dates": blocked_dates, "reason": reason},
            "timestamp": now
        }).execute()
        
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
    admin_user: UserDB = Depends(get_admin_user)
):
    """Create a new promo code (Admin only)"""
    try:
        supabase = get_supabase()
        now = datetime.utcnow()
        
        if not valid_from:
            valid_from = now
        if not valid_until:
            valid_until = now + timedelta(days=30)
        
        # Check if promo code already exists
        existing_result = supabase.table("promo_codes").select("id").eq("code", code.upper()).execute()
        if existing_result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Promo code already exists"
            )
        
        promo_id = str(uuid.uuid4())
        promo_data = {
            "id": promo_id,
            "code": code.upper(),
            "discount_type": discount_type,
            "discount_value": discount_value,
            "min_amount": min_amount,
            "max_discount": max_discount,
            "valid_from": valid_from.isoformat(),
            "valid_until": valid_until.isoformat(),
            "usage_limit": usage_limit,
            "used_count": 0,
            "active": True,
            "applicable_room_types": applicable_room_types,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        
        supabase.table("promo_codes").insert(promo_data).execute()
        
        # Log the action
        supabase.table("audit_logs").insert({
            "id": str(uuid.uuid4()),
            "actor": str(admin_user.id),
            "action": "promo_code_created",
            "resource": "promo_code",
            "resource_id": promo_id,
            "after": promo_data,
            "timestamp": now.isoformat()
        }).execute()
        
        return {
            "success": True,
            "promo_code": {
                "id": promo_id,
                "code": code.upper(),
                "discount_type": discount_type,
                "discount_value": discount_value,
                "valid_from": valid_from.isoformat(),
                "valid_until": valid_until.isoformat()
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
