from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import UserDB, UserStatus
from app.config import settings
import secrets
import string
import warnings

# Suppress bcrypt version warning
warnings.filterwarnings("ignore", message=".*bcrypt.*", category=UserWarning)

# Password hashing - optimized for faster hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# JWT token handling
security = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def validate_password_strength(password: str) -> bool:
    """Validate password meets security requirements"""
    if len(password) < 8 or len(password) > 128:
        return False
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    return all([has_upper, has_lower, has_digit, has_special])

def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_refresh_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_token(token: str, secret_key: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None

async def get_user_by_id(user_id: str) -> Optional[UserDB]:
    """Get user by ID from Supabase"""
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if result.data:
        return UserDB(**result.data[0])
    return None

async def get_user_by_email(email: str) -> Optional[UserDB]:
    """Get user by email from Supabase (case-insensitive)"""
    supabase = get_supabase()
    result = supabase.table("users").select("*").ilike("email", email).execute()
    if result.data:
        return UserDB(**result.data[0])
    return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserDB:
    """Get current authenticated user from JWT token"""
    
    # Try to get token from Authorization header first
    token = None
    if credentials:
        token = credentials.credentials
    
    # If no Authorization header, try to get from cookies
    if not token:
        token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token
    payload = verify_token(token, settings.jwt_secret_key)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not active",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserDB]:
    """Get current authenticated user from JWT token (optional)"""
    
    # Try to get token from Authorization header first
    token = None
    if credentials:
        token = credentials.credentials
    
    # If no Authorization header, try to get from cookies
    if not token:
        token = request.cookies.get("access_token")
    
    if not token:
        return None
    
    # Verify token
    payload = verify_token(token, settings.jwt_secret_key)
    if not payload or payload.get("type") != "access":
        return None
    
    user_id: str = payload.get("sub")
    if user_id is None:
        return None
    
    # Get user from database
    user = await get_user_by_id(user_id)
    if user is None or user.status != UserStatus.ACTIVE:
        return None
    
    return user

async def get_current_active_user(current_user: UserDB = Depends(get_current_user)) -> UserDB:
    """Get current active user"""
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user
