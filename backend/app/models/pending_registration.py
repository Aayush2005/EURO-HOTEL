from beanie import Document
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class PendingRegistration(Document):
    """Temporary storage for pending user registrations"""
    email: EmailStr
    username: str
    password_hash: str
    phone: Optional[str] = None
    otp_code: str
    otp_expiry: datetime
    created_at: datetime = datetime.utcnow()
    
    class Settings:
        name = "pending_registrations"
        
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }