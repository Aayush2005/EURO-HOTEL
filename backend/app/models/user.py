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
    username: Indexed(str, unique=True)
    password_hash: str
    phone: str
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
            [("username", 1)],
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
    username: str = Field(..., min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
    password: str = Field(..., min_length=8)
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{1,14}$')

class UserLogin(BaseModel):
    login: str  # email or username
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
    username: Optional[str] = Field(None, min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')
    phone: Optional[str] = Field(None, pattern=r'^\+?[1-9]\d{1,14}$')
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=8)

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    phone: str
    status: UserStatus
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse