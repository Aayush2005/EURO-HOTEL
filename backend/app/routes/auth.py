from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.models.user import (
    UserDB, UserRegister, UserLogin, VerifyOTP, ResetPasswordRequest, 
    ResetPassword, UpdateProfile, UserResponse, TokenResponse, UserStatus
)
from app.models.pending_registration import PendingRegistrationDB
from app.auth import (
    get_password_hash, verify_password, validate_password_strength,
    create_access_token, create_refresh_token, verify_token, generate_otp,
    get_current_active_user, get_user_by_email, get_user_by_id
)
from app.database import get_supabase
from app.email import send_otp_email
from app.config import settings
import logging
import uuid

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user - stores in pending until OTP verification"""
    supabase = get_supabase()
    
    # Validate password strength
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
        )
    
    # Check if user already exists (case-insensitive)
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if pending registration exists
    pending_result = supabase.table("pending_registrations").select("*").ilike("email", user_data.email).execute()
    if pending_result.data:
        # Remove old pending registration
        supabase.table("pending_registrations").delete().eq("id", pending_result.data[0]["id"]).execute()
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    # Store in pending registrations
    pending_data = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": get_password_hash(user_data.password),
        "phone": user_data.phone,
        "country_code": user_data.country_code,
        "otp_code": otp_code,
        "otp_expiry": otp_expiry.isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("pending_registrations").insert(pending_data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create pending registration"
        )
    
    # Send OTP email
    email_sent = await send_otp_email(user_data.email, otp_code, "account verification")
    
    if not email_sent:
        logger.warning(f"Failed to send OTP email to {user_data.email}")
        # If email fails, remove pending registration
        supabase.table("pending_registrations").delete().eq("id", pending_data["id"]).execute()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again."
        )
    
    return {
        "message": "Registration initiated. Please check your email for verification code.",
        "email": user_data.email
    }

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(response: Response, otp_data: VerifyOTP):
    """Verify OTP and create actual user account"""
    supabase = get_supabase()
    
    # First check if it's a pending registration (case-insensitive)
    pending_result = supabase.table("pending_registrations").select("*").ilike("email", otp_data.email).execute()
    
    user = None
    
    if pending_result.data:
        pending = pending_result.data[0]
        
        # Check OTP
        if pending["otp_code"] != otp_data.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )
        
        # Check OTP expiry
        otp_expiry = datetime.fromisoformat(pending["otp_expiry"].replace("Z", "+00:00").replace("+00:00", ""))
        if datetime.utcnow() > otp_expiry:
            supabase.table("pending_registrations").delete().eq("id", pending["id"]).execute()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired. Please register again."
            )
        
        # Check if user was created in the meantime
        existing_user = await get_user_by_email(pending["email"])
        if existing_user:
            supabase.table("pending_registrations").delete().eq("id", pending["id"]).execute()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create the actual user account
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        user_data = {
            "id": user_id,
            "email": pending["email"],
            "name": pending["name"],
            "password_hash": pending["password_hash"],
            "phone": pending["phone"],
            "country_code": pending["country_code"],
            "status": UserStatus.ACTIVE.value,
            "refresh_tokens": [],
            "created_at": now,
            "updated_at": now
        }
        
        result = supabase.table("users").insert(user_data).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )
        
        user = UserDB(**result.data[0])
        
        # Clean up pending registration
        supabase.table("pending_registrations").delete().eq("id", pending["id"]).execute()
        
    else:
        # Check if it's an existing user (password reset, etc.)
        user = await get_user_by_email(otp_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending registration or user found for this email"
            )
        
        # Check OTP for existing user
        if not user.otp_code or user.otp_code != otp_data.otp_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code"
            )
        
        # Check OTP expiry
        if not user.otp_expiry or datetime.utcnow() > user.otp_expiry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired"
            )
        
        # Activate user and clear OTP
        supabase.table("users").update({
            "status": UserStatus.ACTIVE.value,
            "otp_code": None,
            "otp_expiry": None,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", user.id).execute()
        
        user.status = UserStatus.ACTIVE
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token
    refresh_tokens = user.refresh_tokens if user.refresh_tokens else []
    refresh_tokens.append(refresh_token)
    supabase.table("users").update({
        "refresh_tokens": refresh_tokens
    }).eq("id", user.id).execute()
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.access_token_expire_minutes * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )
    
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        phone=user.phone,
        country_code=user.country_code,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, login_data: UserLogin):
    """Login user"""
    supabase = get_supabase()
    
    # Find user by email (case-insensitive)
    user = await get_user_by_email(login_data.email)
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not verified. Please check your email for verification code."
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token
    refresh_tokens = user.refresh_tokens if user.refresh_tokens else []
    refresh_tokens.append(refresh_token)
    supabase.table("users").update({
        "refresh_tokens": refresh_tokens,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", user.id).execute()
    
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.access_token_expire_minutes * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60
    )
    
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        phone=user.phone,
        country_code=user.country_code,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(request: Request, response: Response):
    """Refresh access token"""
    supabase = get_supabase()
    
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    # Verify refresh token
    payload = verify_token(refresh_token, settings.jwt_refresh_secret_key)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = await get_user_by_id(user_id)
    
    if not user or refresh_token not in (user.refresh_tokens or []):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set new access token cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.access_token_expire_minutes * 60
    )
    
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        phone=user.phone,
        country_code=user.country_code,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/logout")
async def logout(request: Request, response: Response, current_user: UserDB = Depends(get_current_active_user)):
    """Logout user"""
    supabase = get_supabase()
    
    refresh_token = request.cookies.get("refresh_token")
    
    # Remove refresh token from user
    if refresh_token and refresh_token in (current_user.refresh_tokens or []):
        refresh_tokens = [t for t in current_user.refresh_tokens if t != refresh_token]
        supabase.table("users").update({
            "refresh_tokens": refresh_tokens
        }).eq("id", current_user.id).execute()
    
    # Clear cookies
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="strict")
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="strict")
    
    return {"message": "Successfully logged out"}

@router.post("/reset-password-request")
@limiter.limit("3/minute")
async def reset_password_request(request: Request, reset_data: ResetPasswordRequest):
    """Request password reset"""
    supabase = get_supabase()
    
    user = await get_user_by_email(reset_data.email)
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset code has been sent."}
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    supabase.table("users").update({
        "otp_code": otp_code,
        "otp_expiry": otp_expiry.isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", user.id).execute()
    
    # Send OTP email
    await send_otp_email(reset_data.email, otp_code, "password reset")
    
    return {"message": "If the email exists, a reset code has been sent."}

@router.post("/reset-password")
async def reset_password(reset_data: ResetPassword):
    """Reset password with OTP"""
    supabase = get_supabase()
    
    if not validate_password_strength(reset_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
        )
    
    user = await get_user_by_email(reset_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check OTP
    if not user.otp_code or user.otp_code != reset_data.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Check OTP expiry
    if not user.otp_expiry or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired"
        )
    
    # Update password
    supabase.table("users").update({
        "password_hash": get_password_hash(reset_data.new_password),
        "otp_code": None,
        "otp_expiry": None,
        "refresh_tokens": [],
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", user.id).execute()
    
    return {"message": "Password reset successfully"}

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile, current_user: UserDB = Depends(get_current_active_user)):
    """Update user profile"""
    supabase = get_supabase()
    
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    
    # If changing password, verify current password
    if profile_data.new_password:
        if not profile_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password required to change password"
            )
        
        if not verify_password(profile_data.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        if not validate_password_strength(profile_data.new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
            )
        
        update_data["password_hash"] = get_password_hash(profile_data.new_password)
        update_data["refresh_tokens"] = []
    
    # Update name if provided
    if profile_data.name and profile_data.name != current_user.name:
        update_data["name"] = profile_data.name
    
    # Update phone if provided
    if profile_data.phone:
        update_data["phone"] = profile_data.phone
    
    # Update country code if provided
    if profile_data.country_code:
        update_data["country_code"] = profile_data.country_code
    
    # Perform update
    result = supabase.table("users").update(update_data).eq("id", current_user.id).execute()
    
    if result.data:
        updated_user = UserDB(**result.data[0])
    else:
        updated_user = current_user
        for key, value in update_data.items():
            if hasattr(updated_user, key):
                setattr(updated_user, key, value)
    
    return UserResponse(
        id=str(updated_user.id),
        email=updated_user.email,
        name=updated_user.name,
        phone=updated_user.phone,
        country_code=updated_user.country_code,
        status=updated_user.status,
        created_at=updated_user.created_at
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserDB = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        phone=current_user.phone,
        country_code=current_user.country_code,
        status=current_user.status,
        created_at=current_user.created_at
    )
