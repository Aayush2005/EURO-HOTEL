from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class User(Document):
    email: Indexed(EmailStr, unique=True)
    name: str  # Full name of the person
    password_hash: str
    phone: str
    country_code: str = Field(default="+91")  # Separate field for country code
    status: UserStatus = UserStatus.PENDING
    otp_code: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    refresh_tokens: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            [("email", 1)],
            [("otp_expiry", 1)],
        ]

class Session(Document):
    user_id: str
    refresh_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "sessions"
        indexes = [
            [("user_id", 1)],
            [("refresh_token", 1)],
            [("expires_at", 1)],
        ]

# Pydantic models for API
class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    phone: str = Field(..., pattern=r'^[1-9]\d{6,14}$')  # Just the phone number without country code
    country_code: str = Field(default="+91")

class UserLogin(BaseModel):
    email: EmailStr  # Only email for login
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
    phone: Optional[str] = Field(None, pattern=r'^[1-9]\d{6,14}$')  # Just the phone number without country code
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
