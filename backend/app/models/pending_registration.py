from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class PendingRegistration(Document):
    """Temporary storage for pending user registrations"""
    email: EmailStr
    name: str
    password_hash: str
    phone: Optional[str] = None
    country_code: str = "+91"  # Default to India
    otp_code: str
    otp_expiry: datetime
    created_at: Indexed(datetime, expireAfterSeconds=600) = datetime.utcnow()  # TTL index: expire after 10 minutes
    
    class Settings:
        name = "pending_registrations"
        
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }