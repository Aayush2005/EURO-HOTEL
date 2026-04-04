from fastapi import APIRouter, HTTPException, status, Depends, Request, Header
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from slowapi import Limiter
from slowapi.util import get_remote_address
import json
import logging

from app.services.payment_service import PaymentService
from app.auth import get_current_user
from app.models.user import UserDB

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api", tags=["payment"])

@router.post("/payments/create-session")
@limiter.limit("5/minute")
async def create_payment_session(
    request: Request,
    booking_id: str,
    current_user: Optional[UserDB] = Depends(get_current_user)
):
    """Create Razorpay payment session for booking"""
    try:
        payment_service = PaymentService()
        session_data = await payment_service.create_payment_session(booking_id)
        
        return {
            "success": True,
            "data": session_data
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating payment session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment session"
        )

@router.post("/payments/verify")
async def verify_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
):
    """Verify payment after successful transaction"""
    try:
        payment_service = PaymentService()
        result = await payment_service.handle_payment_success(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )
        
        return {
            "success": True,
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )

@router.post("/payments/failure")
async def handle_payment_failure(
    razorpay_order_id: str,
    error_code: str,
    error_description: str
):
    """Handle payment failure"""
    try:
        payment_service = PaymentService()
        result = await payment_service.handle_payment_failure(
            razorpay_order_id,
            error_code,
            error_description
        )
        
        return {
            "success": True,
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to handle payment failure"
        )

@router.get("/payments/{booking_id}/status")
async def get_payment_status(
    booking_id: str,
    current_user: Optional[UserDB] = Depends(get_current_user)
):
    """Get payment status for a booking"""
    try:
        payment_service = PaymentService()
        status_data = await payment_service.get_payment_status(booking_id)
        
        return {
            "success": True,
            "data": status_data
        }
        
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get payment status"
        )

@router.post("/webhooks/payment/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None)
):
    """Handle Razorpay webhooks"""
    try:
        # Get raw body
        body = await request.body()
        payload = json.loads(body.decode())
        
        if not x_razorpay_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing signature header"
            )
        
        payment_service = PaymentService()
        result = await payment_service.process_webhook(payload, x_razorpay_signature)
        
        return {
            "success": True,
            "data": result
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
    except ValueError as e:
        logger.warning(f"Webhook verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook"
        )

@router.post("/payments/{booking_id}/refund")
async def initiate_refund(
    booking_id: str,
    amount: float,
    reason: str = "Booking cancelled",
    current_user: UserDB = Depends(get_current_user)  # Admin only in production
):
    """Initiate refund for a booking (Admin endpoint)"""
    try:
        payment_service = PaymentService()
        result = await payment_service.initiate_refund(booking_id, amount, reason)
        
        return {
            "success": True,
            "data": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error initiating refund: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate refund"
        )
