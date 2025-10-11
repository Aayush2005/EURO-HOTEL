from typing import Dict, Any, Optional
import razorpay
import hmac
import hashlib
from datetime import datetime

from app.models.booking import Booking, Payment, PaymentStatus, BookingStatus
from app.config import settings

class PaymentService:
    
    def __init__(self):
        self.razorpay_client = razorpay.Client(
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret)
        )
    
    async def create_payment_session(self, booking_id: str) -> Dict[str, Any]:
        """Create Razorpay payment session for booking"""
        booking = await Booking.get(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        if booking.status != BookingStatus.CONFIRMED:
            raise ValueError("Booking not confirmed")
        
        if booking.payment_status == PaymentStatus.PAID:
            raise ValueError("Booking already paid")
        
        # Check if payment record already exists
        existing_payment = await Payment.find_one(Payment.booking_id == booking_id)
        if existing_payment and existing_payment.provider_order_id:
            # Return existing order if still valid
            try:
                order = self.razorpay_client.order.fetch(existing_payment.provider_order_id)
                if order['status'] == 'created':
                    return {
                        "order_id": existing_payment.provider_order_id,
                        "amount": existing_payment.amount,
                        "currency": existing_payment.currency,
                        "booking_reference": booking.booking_reference,
                        "guest_name": booking.guest_details.name,
                        "guest_email": booking.guest_details.email,
                        "guest_phone": booking.guest_details.phone
                    }
            except Exception:
                pass  # Create new order if existing one is invalid
        
        # Create Razorpay order
        order_data = {
            "amount": int(booking.pricing.total_amount * 100),  # Amount in paise
            "currency": "INR",
            "receipt": booking.booking_reference,
            "notes": {
                "booking_id": booking_id,
                "booking_reference": booking.booking_reference,
                "guest_name": booking.guest_details.name
            }
        }
        
        try:
            razorpay_order = self.razorpay_client.order.create(order_data)
            
            # Create or update payment record
            if existing_payment:
                existing_payment.provider_order_id = razorpay_order['id']
                existing_payment.amount = booking.pricing.total_amount
                existing_payment.status = PaymentStatus.PENDING
                await existing_payment.save()
                payment = existing_payment
            else:
                payment = Payment(
                    booking_id=booking_id,
                    provider="razorpay",
                    provider_order_id=razorpay_order['id'],
                    amount=booking.pricing.total_amount,
                    currency="INR",
                    status=PaymentStatus.PENDING
                )
                await payment.insert()
            
            return {
                "order_id": razorpay_order['id'],
                "amount": booking.pricing.total_amount,
                "currency": "INR",
                "booking_reference": booking.booking_reference,
                "guest_name": booking.guest_details.name,
                "guest_email": booking.guest_details.email,
                "guest_phone": booking.guest_details.phone,
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
        # Verify signature
        if not await self.verify_payment_signature(
            razorpay_order_id, razorpay_payment_id, razorpay_signature
        ):
            raise ValueError("Invalid payment signature")
        
        # Find payment record
        payment = await Payment.find_one(Payment.provider_order_id == razorpay_order_id)
        if not payment:
            raise ValueError("Payment record not found")
        
        # Get booking
        booking = await Booking.get(payment.booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Update payment record
        payment.provider_payment_id = razorpay_payment_id
        payment.status = PaymentStatus.PAID
        payment.captured_at = datetime.utcnow()
        await payment.save()
        
        # Update booking payment status
        booking.payment_status = PaymentStatus.PAID
        booking.updated_at = datetime.utcnow()
        await booking.save()
        
        return {
            "booking_id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "payment_status": "success",
            "amount": payment.amount,
            "payment_id": razorpay_payment_id
        }
    
    async def handle_payment_failure(
        self,
        razorpay_order_id: str,
        error_code: str,
        error_description: str
    ) -> Dict[str, Any]:
        """Handle failed payment"""
        # Find payment record
        payment = await Payment.find_one(Payment.provider_order_id == razorpay_order_id)
        if not payment:
            raise ValueError("Payment record not found")
        
        # Get booking
        booking = await Booking.get(payment.booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Update payment record
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = f"{error_code}: {error_description}"
        await payment.save()
        
        # Update booking payment status
        booking.payment_status = PaymentStatus.FAILED
        booking.updated_at = datetime.utcnow()
        await booking.save()
        
        return {
            "booking_id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "payment_status": "failed",
            "error": error_description
        }
    
    async def process_webhook(self, payload: Dict[str, Any], signature: str) -> Dict[str, Any]:
        """Process Razorpay webhook"""
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
        
        if event == 'payment.captured':
            # Payment successful
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            
            payment = await Payment.find_one(Payment.provider_order_id == order_id)
            if payment:
                payment.provider_payment_id = payment_id
                payment.status = PaymentStatus.PAID
                payment.captured_at = datetime.utcnow()
                await payment.save()
                
                # Update booking
                booking = await Booking.get(payment.booking_id)
                if booking:
                    booking.payment_status = PaymentStatus.PAID
                    booking.updated_at = datetime.utcnow()
                    await booking.save()
                
                return {"status": "processed", "event": "payment_captured"}
        
        elif event == 'payment.failed':
            # Payment failed
            order_id = payment_entity.get('order_id')
            error_code = payment_entity.get('error_code')
            error_description = payment_entity.get('error_description')
            
            payment = await Payment.find_one(Payment.provider_order_id == order_id)
            if payment:
                payment.status = PaymentStatus.FAILED
                payment.failure_reason = f"{error_code}: {error_description}"
                await payment.save()
                
                # Update booking
                booking = await Booking.get(payment.booking_id)
                if booking:
                    booking.payment_status = PaymentStatus.FAILED
                    booking.updated_at = datetime.utcnow()
                    await booking.save()
                
                return {"status": "processed", "event": "payment_failed"}
        
        return {"status": "ignored", "event": event}
    
    async def initiate_refund(self, booking_id: str, amount: float, reason: str = "Booking cancelled") -> Dict[str, Any]:
        """Initiate refund for a booking"""
        payment = await Payment.find_one(
            Payment.booking_id == booking_id,
            Payment.status == PaymentStatus.PAID
        )
        
        if not payment or not payment.provider_payment_id:
            raise ValueError("No successful payment found for this booking")
        
        try:
            refund_data = {
                "amount": int(amount * 100),  # Amount in paise
                "notes": {
                    "booking_id": booking_id,
                    "reason": reason
                }
            }
            
            refund = self.razorpay_client.payment.refund(
                payment.provider_payment_id,
                refund_data
            )
            
            # Update payment status
            if amount >= payment.amount:
                payment.status = PaymentStatus.REFUNDED
            else:
                payment.status = PaymentStatus.PARTIALLY_PAID
            
            await payment.save()
            
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
        payment = await Payment.find_one(Payment.booking_id == booking_id)
        if not payment:
            return {"status": "not_found"}
        
        booking = await Booking.get(booking_id)
        
        return {
            "booking_id": booking_id,
            "booking_reference": booking.booking_reference if booking else None,
            "payment_status": payment.status.value,
            "amount": payment.amount,
            "currency": payment.currency,
            "provider_payment_id": payment.provider_payment_id,
            "created_at": payment.created_at,
            "captured_at": payment.captured_at
        }