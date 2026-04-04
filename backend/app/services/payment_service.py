from typing import Dict, Any, Optional
import razorpay
import hmac
import hashlib
from datetime import datetime
import uuid

from app.models.booking import BookingDB, PaymentDB, PaymentStatus, BookingStatus
from app.database import get_supabase
from app.config import settings

class PaymentService:
    
    def __init__(self):
        self.razorpay_client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )
    
    async def create_payment_session(self, booking_id: str) -> Dict[str, Any]:
        """Create Razorpay payment session for booking"""
        supabase = get_supabase()
        
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()
        if not result.data:
            raise ValueError("Booking not found")
        
        booking = result.data[0]
        
        if booking["status"] != BookingStatus.CONFIRMED.value:
            raise ValueError("Booking not confirmed")
        
        if booking["payment_status"] == PaymentStatus.PAID.value:
            raise ValueError("Booking already paid")
        
        # Check if payment record already exists
        payment_result = supabase.table("payments").select("*").eq("booking_id", booking_id).execute()
        existing_payment = payment_result.data[0] if payment_result.data else None
        
        if existing_payment and existing_payment.get("provider_order_id"):
            # Return existing order if still valid
            try:
                order = self.razorpay_client.order.fetch(existing_payment["provider_order_id"])
                if order['status'] == 'created':
                    return {
                        "order_id": existing_payment["provider_order_id"],
                        "amount": existing_payment["amount"],
                        "currency": existing_payment["currency"],
                        "booking_reference": booking["booking_reference"],
                        "guest_name": booking["guest_details"]["name"],
                        "guest_email": booking["guest_details"]["email"],
                        "guest_phone": booking["guest_details"]["phone"]
                    }
            except Exception:
                pass  # Create new order if existing one is invalid
        
        # Create Razorpay order
        order_data = {
            "amount": int(booking["pricing"]["total_amount"] * 100),  # Amount in paise
            "currency": "INR",
            "receipt": booking["booking_reference"],
            "notes": {
                "booking_id": booking_id,
                "booking_reference": booking["booking_reference"],
                "guest_name": booking["guest_details"]["name"]
            }
        }
        
        try:
            razorpay_order = self.razorpay_client.order.create(order_data)
            now = datetime.utcnow().isoformat()
            
            # Create or update payment record
            if existing_payment:
                supabase.table("payments").update({
                    "provider_order_id": razorpay_order['id'],
                    "amount": booking["pricing"]["total_amount"],
                    "status": PaymentStatus.PENDING.value
                }).eq("id", existing_payment["id"]).execute()
            else:
                payment_data = {
                    "id": str(uuid.uuid4()),
                    "booking_id": booking_id,
                    "provider": "razorpay",
                    "provider_order_id": razorpay_order['id'],
                    "amount": booking["pricing"]["total_amount"],
                    "currency": "INR",
                    "status": PaymentStatus.PENDING.value,
                    "created_at": now
                }
                supabase.table("payments").insert(payment_data).execute()
            
            return {
                "order_id": razorpay_order['id'],
                "amount": booking["pricing"]["total_amount"],
                "currency": "INR",
                "booking_reference": booking["booking_reference"],
                "guest_name": booking["guest_details"]["name"],
                "guest_email": booking["guest_details"]["email"],
                "guest_phone": booking["guest_details"]["phone"],
                "key_id": settings.razorpay_key_id
            }
            
        except Exception as e:
            raise ValueError(f"Failed to create payment session: {str(e)}")
    
    async def verify_payment_signature(
        self, 
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """Verify Razorpay payment signature"""
        try:
            # Create signature string
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                settings.razorpay_key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, razorpay_signature)
            
        except Exception:
            return False
    
    async def handle_payment_success(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> Dict[str, Any]:
        """Handle successful payment"""
        supabase = get_supabase()
        
        # Verify signature
        if not await self.verify_payment_signature(
            razorpay_order_id, razorpay_payment_id, razorpay_signature
        ):
            raise ValueError("Invalid payment signature")
        
        # Find payment record
        payment_result = supabase.table("payments").select("*").eq("provider_order_id", razorpay_order_id).execute()
        if not payment_result.data:
            raise ValueError("Payment record not found")
        
        payment = payment_result.data[0]
        
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", payment["booking_id"]).execute()
        if not booking_result.data:
            raise ValueError("Booking not found")
        
        booking = booking_result.data[0]
        now = datetime.utcnow().isoformat()
        
        # Update payment record
        supabase.table("payments").update({
            "provider_payment_id": razorpay_payment_id,
            "status": PaymentStatus.PAID.value,
            "captured_at": now
        }).eq("id", payment["id"]).execute()
        
        # Update booking payment status
        supabase.table("bookings").update({
            "payment_status": PaymentStatus.PAID.value,
            "updated_at": now
        }).eq("id", payment["booking_id"]).execute()
        
        return {
            "booking_id": booking["id"],
            "booking_reference": booking["booking_reference"],
            "payment_status": "success",
            "amount": payment["amount"],
            "payment_id": razorpay_payment_id
        }
    
    async def handle_payment_failure(
        self,
        razorpay_order_id: str,
        error_code: str,
        error_description: str
    ) -> Dict[str, Any]:
        """Handle failed payment"""
        supabase = get_supabase()
        
        # Find payment record
        payment_result = supabase.table("payments").select("*").eq("provider_order_id", razorpay_order_id).execute()
        if not payment_result.data:
            raise ValueError("Payment record not found")
        
        payment = payment_result.data[0]
        
        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", payment["booking_id"]).execute()
        if not booking_result.data:
            raise ValueError("Booking not found")
        
        booking = booking_result.data[0]
        now = datetime.utcnow().isoformat()
        
        # Update payment record
        supabase.table("payments").update({
            "status": PaymentStatus.FAILED.value,
            "failure_reason": f"{error_code}: {error_description}"
        }).eq("id", payment["id"]).execute()
        
        # Update booking payment status
        supabase.table("bookings").update({
            "payment_status": PaymentStatus.FAILED.value,
            "updated_at": now
        }).eq("id", payment["booking_id"]).execute()
        
        return {
            "booking_id": booking["id"],
            "booking_reference": booking["booking_reference"],
            "payment_status": "failed",
            "error": error_description
        }
    
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """Process Razorpay webhook"""
        supabase = get_supabase()
        
        # Verify webhook signature
        expected_signature = hmac.new(
            settings.razorpay_webhook_secret.encode(),
            str(payload).encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, signature):
            raise ValueError("Invalid webhook signature")
        
        event = payload.get('event')
        payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        now = datetime.utcnow().isoformat()
        
        if event == 'payment.captured':
            # Payment successful
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            
            payment_result = supabase.table("payments").select("*").eq("provider_order_id", order_id).execute()
            if payment_result.data:
                payment = payment_result.data[0]
                
                supabase.table("payments").update({
                    "provider_payment_id": payment_id,
                    "status": PaymentStatus.PAID.value,
                    "captured_at": now
                }).eq("id", payment["id"]).execute()
                
                # Update booking
                supabase.table("bookings").update({
                    "payment_status": PaymentStatus.PAID.value,
                    "updated_at": now
                }).eq("id", payment["booking_id"]).execute()
                
                return {"status": "processed", "event": "payment_captured"}
        
        elif event == 'payment.failed':
            # Payment failed
            order_id = payment_entity.get('order_id')
            error_code = payment_entity.get('error_code')
            error_description = payment_entity.get('error_description')
            
            payment_result = supabase.table("payments").select("*").eq("provider_order_id", order_id).execute()
            if payment_result.data:
                payment = payment_result.data[0]
                
                supabase.table("payments").update({
                    "status": PaymentStatus.FAILED.value,
                    "failure_reason": f"{error_code}: {error_description}"
                }).eq("id", payment["id"]).execute()
                
                # Update booking
                supabase.table("bookings").update({
                    "payment_status": PaymentStatus.FAILED.value,
                    "updated_at": now
                }).eq("id", payment["booking_id"]).execute()
                
                return {"status": "processed", "event": "payment_failed"}
        
        return {"status": "ignored", "event": event}
    
    async def initiate_refund(self, booking_id: str, amount: float, reason: str = "Booking cancelled") -> Dict[str, Any]:
        """Initiate refund for a booking"""
        supabase = get_supabase()
        
        payment_result = supabase.table("payments").select("*").eq("booking_id", booking_id).eq("status", PaymentStatus.PAID.value).execute()
        
        if not payment_result.data or not payment_result.data[0].get("provider_payment_id"):
            raise ValueError("No successful payment found for this booking")
        
        payment = payment_result.data[0]
        
        try:
            refund_data = {
                "amount": int(amount * 100),  # Amount in paise
                "notes": {
                    "booking_id": booking_id,
                    "reason": reason
                }
            }
            
            refund = self.razorpay_client.payment.refund(
                payment["provider_payment_id"],
                refund_data
            )
            
            # Update payment status
            new_status = PaymentStatus.REFUNDED.value if amount >= payment["amount"] else PaymentStatus.PARTIALLY_PAID.value
            supabase.table("payments").update({
                "status": new_status
            }).eq("id", payment["id"]).execute()
            
            return {
                "refund_id": refund['id'],
                "amount": amount,
                "status": refund['status'],
                "booking_id": booking_id
            }
            
        except Exception as e:
            raise ValueError(f"Failed to initiate refund: {str(e)}")
    
    async def get_payment_status(self, booking_id: str) -> Dict[str, Any]:
        """Get payment status for a booking"""
        supabase = get_supabase()
        
        payment_result = supabase.table("payments").select("*").eq("booking_id", booking_id).execute()
        if not payment_result.data:
            return {"status": "not_found"}
        
        payment = payment_result.data[0]
        
        booking_result = supabase.table("bookings").select("booking_reference").eq("id", booking_id).execute()
        booking_reference = booking_result.data[0]["booking_reference"] if booking_result.data else None
        
        return {
            "booking_id": booking_id,
            "booking_reference": booking_reference,
            "payment_status": payment["status"],
            "amount": payment["amount"],
            "currency": payment["currency"],
            "provider_payment_id": payment.get("provider_payment_id"),
            "created_at": payment["created_at"],
            "captured_at": payment.get("captured_at")
        }
