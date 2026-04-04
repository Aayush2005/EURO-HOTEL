from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class PendingRegistrationDB(BaseModel):
    """Pending registration model for database operations"""
    id: str
    email: str
    name: str
    password_hash: str
    phone: Optional[str] = None
    country_code: str = "+91"
    otp_code: str
    otp_expiry: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Alias for backward compatibility
PendingRegistration = PendingRegistrationDB
