"""
Authentication router for user management.

This module provides endpoints for user registration, login, and profile management.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import structlog

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate, UserProfile, PasswordChange, PasswordReset, EmailVerification, UserLogin
from app.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
logger = structlog.get_logger()


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
) -> Token:
    """
    Authenticate user and return JWT token.
    
    Expected payload:
    {
        "email": "user@example.com",
        "password": "userpassword",
        "unique_identification_code": "ABC123DEF456"
    }
    """
    
    # Get user from database by email
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # Verify user exists, password matches, and unique identification code matches
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or identification code",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.verify_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or identification code",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.unique_identification_code != login_data.unique_identification_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or identification code",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": str(user.id),
        "exp": datetime.utcnow() + access_token_expires
    }
    
    access_token = jwt.encode(
        token_data,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=access_token_expires.total_seconds()
    )




@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Register a new user with secure password hashing and salting.
    
    Expected payload:
    {
        "email": "user@example.com",
        "password": "SecurePass123",
        "username": "johndoe",
        "full_name": "John Doe"
    }
    
    Security features:
    - Password is hashed using bcrypt with automatic salting
    - Email and username uniqueness validation
    - Password strength validation
    - SQL injection protection through SQLAlchemy ORM
    - Comprehensive audit logging
    """
    try:
        # Log registration attempt
        logger.info(
            "User registration attempt",
            email=user_data.email,
            username=user_data.username,
            timestamp=datetime.utcnow().isoformat()
        )
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            if existing_user.email == user_data.email:
                logger.warning(
                    "Registration failed - email already exists",
                    email=user_data.email,
                    timestamp=datetime.utcnow().isoformat()
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            else:
                logger.warning(
                    "Registration failed - username already exists",
                    username=user_data.username,
                    timestamp=datetime.utcnow().isoformat()
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Generate unique identification code
        unique_code = User.generate_unique_code()
        
        # Create new user with secure password hashing
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            unique_identification_code=unique_code,
            is_active=True,
            is_verified=False  # Require email verification
        )
        
        # Password is automatically hashed and salted using bcrypt
        db_user.set_password(user_data.password)
        
        # Save to database with transaction safety
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Log successful registration
        logger.info(
            "User registration successful",
            user_id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            unique_code=unique_code,
            timestamp=datetime.utcnow().isoformat()
        )
        
        return UserResponse(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            full_name=db_user.full_name,
            unique_identification_code=db_user.unique_identification_code,
            is_active=db_user.is_active,
            is_verified=db_user.is_verified,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at,
            last_login=db_user.last_login,
            display_name=db_user.display_name
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log unexpected errors
        logger.error(
            "Registration failed with unexpected error",
            email=user_data.email,
            username=user_data.username,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to server error"
        )


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserProfile:
    """
    Get current user profile information.
    
    Returns comprehensive user data for account management.
    Requires authentication.
    """
    try:
        logger.info(
            "Profile retrieval",
            user_id=current_user.id,
            timestamp=datetime.utcnow().isoformat()
        )
        
        return UserProfile(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            full_name=current_user.full_name,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            last_login=current_user.last_login
        )
        
    except Exception as e:
        logger.error(
            "Profile retrieval failed",
            user_id=current_user.id,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Update current user profile information.
    
    Allows updating full_name, email, and username.
    Requires authentication and validation.
    """
    try:
        logger.info(
            "Profile update attempt",
            user_id=current_user.id,
            update_data=profile_update.dict(exclude_unset=True),
            timestamp=datetime.utcnow().isoformat()
        )
        
        # Check email uniqueness if being updated
        if profile_update.email and profile_update.email != current_user.email:
            existing_user = db.query(User).filter(User.email == profile_update.email).first()
            if existing_user:
                logger.warning(
                    "Profile update failed - email already exists",
                    user_id=current_user.id,
                    new_email=profile_update.email,
                    timestamp=datetime.utcnow().isoformat()
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Check username uniqueness if being updated
        if profile_update.username and profile_update.username != current_user.username:
            existing_user = db.query(User).filter(User.username == profile_update.username).first()
            if existing_user:
                logger.warning(
                    "Profile update failed - username already exists",
                    user_id=current_user.id,
                    new_username=profile_update.username,
                    timestamp=datetime.utcnow().isoformat()
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update user fields
        update_data = profile_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_user, field, value)
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        logger.info(
            "Profile update successful",
            user_id=current_user.id,
            updated_fields=list(update_data.keys()),
            timestamp=datetime.utcnow().isoformat()
        )
        
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            full_name=current_user.full_name,
            unique_identification_code=current_user.unique_identification_code,
            is_active=current_user.is_active,
            is_verified=current_user.is_verified,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at,
            last_login=current_user.last_login,
            display_name=current_user.display_name
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(
            "Profile update failed with unexpected error",
            user_id=current_user.id,
            error=str(e),
            timestamp=datetime.utcnow().isoformat()
        )
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed due to server error"
        )


@router.post("/logout")
async def logout():
    """
    Proxy logout request to NSE Django Authentication System.
    Requires Authorization header with Bearer token.
    """
    # Note: Logout requires authentication, so the request should include
    # Authorization header which will be forwarded by the proxy
    return await proxy_to_nse_auth("/users/logout/", "POST")


@router.get("/profile")
async def get_profile():
    """
    Proxy profile request to NSE Django Authentication System.
    Requires Authorization header with Bearer token.
    """
    return await proxy_to_nse_auth("/users/profile/", "GET")


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Token:
    """Refresh JWT token."""
    
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": str(current_user.id),
        "exp": datetime.utcnow() + access_token_expires
    }
    
    access_token = jwt.encode(
        token_data,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=access_token_expires.total_seconds()
    )


@router.post("/change-password")
async def change_password(password_data: PasswordChange):
    """
    Proxy password change request to NSE Django Authentication System.
    Requires Authorization header with Bearer token.

    Expected payload:
    {
        "old_password": "currentpassword",
        "new_password": "newpassword"
    }
    """
    return await proxy_to_nse_auth("/users/change-password/", "POST", password_data.dict())


@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """
    Proxy password reset request to NSE Django Authentication System.

    Expected payload:
    {
        "email": "user@example.com"
    }
    """
    return await proxy_to_nse_auth("/users/reset-password/", "POST", reset_data.dict())


@router.get("/health")
async def auth_health_check():
    """
    Check if the NSE Authentication service is healthy.
    """
    try:
        await proxy_to_nse_auth("/health/", "GET")
        return {"status": "healthy", "service": "NSE Authentication"}
    except HTTPException:
        return {"status": "unhealthy", "service": "NSE Authentication"}
