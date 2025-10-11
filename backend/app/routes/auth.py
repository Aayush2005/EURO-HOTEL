from fastapi import APIRouter, HTTPException, status, Depends, Response, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.models.user import (
    User, UserRegister, UserLogin, VerifyOTP, ResetPasswordRequest, 
    ResetPassword, UpdateProfile, UserResponse, TokenResponse, UserStatus
)
from app.auth import (
    get_password_hash, verify_password, validate_password_strength,
    create_access_token, create_refresh_token, verify_token, generate_otp,
    get_current_active_user
)
from app.email import send_otp_email
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user"""
    
    # Validate password strength
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
        )
    
    # Check if user already exists
    existing_user = await User.find_one(
        {"$or": [{"email": user_data.email}, {"username": user_data.username}]}
    )
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=get_password_hash(user_data.password),
        phone=user_data.phone,
        status=UserStatus.PENDING,
        otp_code=otp_code,
        otp_expiry=otp_expiry
    )
    
    await user.insert()
    
    # Send OTP email
    email_sent = await send_otp_email(user_data.email, otp_code, "account verification")
    
    if not email_sent:
        logger.warning(f"Failed to send OTP email to {user_data.email}")
    
    return {
        "message": "Registration successful. Please check your email for verification code.",
        "email": user_data.email
    }

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(response: Response, otp_data: VerifyOTP):
    """Verify OTP and activate account"""
    
    user = await User.find_one({"email": otp_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check OTP
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
    
    # Activate user
    user.status = UserStatus.ACTIVE
    user.otp_code = None
    user.otp_expiry = None
    user.updated_at = datetime.utcnow()
    await user.save()
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token
    user.refresh_tokens.append(refresh_token)
    await user.save()
    
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
        username=user.username,
        phone=user.phone,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, response: Response, login_data: UserLogin):
    """Login user"""
    
    # Find user by email or username
    user = await User.find_one({
        "$or": [
            {"email": login_data.login},
            {"username": login_data.login}
        ]
    })
    
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
    user.refresh_tokens.append(refresh_token)
    user.updated_at = datetime.utcnow()
    await user.save()
    
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
        username=user.username,
        phone=user.phone,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, response: Response):
    """Refresh access token"""
    
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
    user = await User.get(user_id)
    
    if not user or refresh_token not in user.refresh_tokens:
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
        username=user.username,
        phone=user.phone,
        status=user.status,
        created_at=user.created_at
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_active_user)):
    """Logout user"""
    
    refresh_token = request.cookies.get("refresh_token")
    
    # Remove refresh token from user
    if refresh_token and refresh_token in current_user.refresh_tokens:
        current_user.refresh_tokens.remove(refresh_token)
        await current_user.save()
    
    # Clear cookies
    response.delete_cookie(key="access_token", httponly=True, secure=True, samesite="strict")
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="strict")
    
    return {"message": "Successfully logged out"}

@router.post("/reset-password-request")
@limiter.limit("3/minute")
async def reset_password_request(request: Request, reset_data: ResetPasswordRequest):
    """Request password reset"""
    
    user = await User.find_one({"email": reset_data.email})
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset code has been sent."}
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes)
    
    user.otp_code = otp_code
    user.otp_expiry = otp_expiry
    user.updated_at = datetime.utcnow()
    await user.save()
    
    # Send OTP email
    await send_otp_email(reset_data.email, otp_code, "password reset")
    
    return {"message": "If the email exists, a reset code has been sent."}

@router.post("/reset-password")
async def reset_password(reset_data: ResetPassword):
    """Reset password with OTP"""
    
    if not validate_password_strength(reset_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
        )
    
    user = await User.find_one({"email": reset_data.email})
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
    user.password_hash = get_password_hash(reset_data.new_password)
    user.otp_code = None
    user.otp_expiry = None
    user.refresh_tokens = []  # Invalidate all refresh tokens
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": "Password reset successfully"}

@router.put("/update-profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile, current_user: User = Depends(get_current_active_user)):
    """Update user profile"""
    
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
        
        current_user.password_hash = get_password_hash(profile_data.new_password)
        current_user.refresh_tokens = []  # Invalidate all refresh tokens
    
    # Update username if provided
    if profile_data.username and profile_data.username != current_user.username:
        # Check if username is already taken
        existing_user = await User.find_one({"username": profile_data.username})
        if existing_user and str(existing_user.id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = profile_data.username
    
    # Update phone if provided
    if profile_data.phone:
        current_user.phone = profile_data.phone
    
    current_user.updated_at = datetime.utcnow()
    await current_user.save()
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        phone=current_user.phone,
        status=current_user.status,
        created_at=current_user.created_at
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        phone=current_user.phone,
        status=current_user.status,
        created_at=current_user.created_at
    )