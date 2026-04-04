from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"

# Database model (matches Supabase table structure)
class UserDB(BaseModel):
    """User model for database operations"""
    id: str
    email: str
    name: str
    password_hash: str
    phone: str
    country_code: str = "+91"
    status: UserStatus = UserStatus.PENDING
    otp_code: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    refresh_tokens: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SessionDB(BaseModel):
    """Session model for database operations"""
    id: str
    user_id: str
    refresh_token: str
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Pydantic models for API requests
class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    phone: str = Field(..., pattern=r'^[1-9]\d{6,14}$')
    country_code: str = Field(default="+91")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyOTP(BaseModel):
    email: EmailStr
    otp_code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str = Field(..., min_length=8)

class UpdateProfile(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^[1-9]\d{6,14}$')
    country_code: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=8)

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    phone: str
    country_code: str
    status: UserStatus
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Aliases for backward compatibility
User = UserDB
Session = SessionDB
