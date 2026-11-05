from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, Farm, PasswordResetToken
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UserResponse,
    FarmUpdate,
    FarmResponse,
    Token,
    OTPRequest,
    OTPVerify,
    OTPLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.config import settings
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user
from app.services.email_service import send_otp_email, send_password_reset_email
import random
import secrets
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])



@router.post("/register", response_model=Token)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Security check: Admin role creation requires secret Admin Access Key
    role = user_in.role if user_in.role in ["Farmer", "Agricultural Professional", "Admin"] else "Farmer"
    if role == "Admin":
        if not user_in.admin_access_key or user_in.admin_access_key.strip() != settings.ADMIN_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or missing Admin Access Key. Unauthorized registration as Admin is blocked."
            )

    # Create user
    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=get_password_hash(user_in.password),
        role=role,
        preferred_language=user_in.preferred_language or "en",
        state=user_in.state or "Kerala",
        district=user_in.district or "Palakkad",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-create initial farm profile if role is Farmer
    if role == "Farmer":
        farm = Farm(
            user_id=user.id,
            farm_name=f"{user.name}'s Farm",
            location=f"{user.district}, {user.state}",
            soil_type="Alluvial" if user.state == "Kerala" else "Loamy",
            current_season="Kharif"
        )
        db.add(farm)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    identifier = user_in.email.strip()
    phone_identifier = "".join(identifier.split())
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.phone == phone_identifier)
    ).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password. Please check your credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name.strip()
    if user_update.phone is not None:
        current_user.phone = user_update.phone.strip()
    if user_update.preferred_language is not None:
        current_user.preferred_language = user_update.preferred_language
    if user_update.state is not None:
        current_user.state = user_update.state
    if user_update.district is not None:
        current_user.district = user_update.district

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.put("/farm", response_model=FarmResponse)
def update_primary_farm(
    farm_update: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()
    if not farm:
        farm = Farm(user_id=current_user.id)
        db.add(farm)

    for field, val in farm_update.model_dump(exclude_unset=True).items():
        setattr(farm, field, val)

    db.commit()
    db.refresh(farm)
    return FarmResponse.model_validate(farm)


from app.models.user import FarmHistory
from app.schemas.user import FarmHistoryCreate, FarmHistoryResponse
from typing import List


@router.get("/farm/history", response_model=List[FarmHistoryResponse])
def get_farmer_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(FarmHistory).filter(FarmHistory.user_id == current_user.id).order_by(FarmHistory.created_at.desc()).all()
    return [FarmHistoryResponse.model_validate(r) for r in records]


@router.post("/farm/history", response_model=FarmHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_farm_history(
    history_in: FarmHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()
    farm_id = farm.id if farm else None

    rec = FarmHistory(
        user_id=current_user.id,
        farm_id=farm_id,
        season=history_in.season.strip(),
        crop_name=history_in.crop_name.strip(),
        area_cultivated=history_in.area_cultivated or 1.0,
        yield_harvested=history_in.yield_harvested.strip() if history_in.yield_harvested else None,
        sowing_date=history_in.sowing_date.strip() if history_in.sowing_date else None,
        harvest_date=history_in.harvest_date.strip() if history_in.harvest_date else None,
        fertilizers_used=history_in.fertilizers_used.strip() if history_in.fertilizers_used else None,
        pest_issues=history_in.pest_issues.strip() if history_in.pest_issues else None,
        revenue_earned=history_in.revenue_earned or 0.0,
        notes=history_in.notes.strip() if history_in.notes else None
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return FarmHistoryResponse.model_validate(rec)


@router.delete("/farm/history/{history_id}")
def delete_farm_history(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = db.query(FarmHistory).filter(FarmHistory.id == history_id, FarmHistory.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Farm history record not found")
    db.delete(rec)
    db.commit()
    return {"status": "success", "message": "Farm history record deleted successfully"}


# ---------------------------------------------------------------------------
# Forgot Password – step 1: request a reset token
# ---------------------------------------------------------------------------
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Accepts an email address. If the account exists, generates a secure
    reset token (valid 30 minutes), stores it in DB, and sends it by email.

    In dev/demo mode (no SMTP configured) the token is returned directly
    in the response so it can be auto-filled in the UI for easy testing.
    Always returns a 200 response to prevent user enumeration.
    """
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()

    dev_token = None  # Only populated in dev/demo mode

    if user:
        # Invalidate any existing unused tokens for this user
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        ).update({"used": True})
        db.commit()

        # Create a new token
        raw_token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(minutes=30)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=raw_token,
            expires_at=expires,
        )
        db.add(reset_token)
        db.commit()

        # Attempt to send via email service (works if SMTP is configured)
        email_sent = send_password_reset_email(user.email, raw_token)

        # In dev/demo mode (no real email sent), expose token in response
        if not email_sent and settings.DEMO_MODE:
            dev_token = raw_token

    response = {
        "status": "success",
        "message": "If an account with that email exists, a password reset link has been sent.",
    }
    if dev_token:
        response["dev_token"] = dev_token
        response["dev_note"] = "SMTP not configured — token returned here for development/demo use only. Remove in production."

    return response


# ---------------------------------------------------------------------------
# Reset Password – step 2: submit token + new password
# ---------------------------------------------------------------------------
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates the reset token and updates the user's password.
    The token is immediately invalidated after use.
    """
    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == payload.token.strip(),
            PasswordResetToken.used == False,
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token. Please request a new one.",
        )

    # Check expiry (expires_at is stored as naive UTC; compare accordingly)
    now_utc = datetime.now(timezone.utc)
    token_expiry = reset_token.expires_at
    # Make timezone-aware if stored as naive
    if token_expiry.tzinfo is None:
        token_expiry = token_expiry.replace(tzinfo=timezone.utc)

    if now_utc > token_expiry:
        reset_token.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one.",
        )

    # Update password
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = get_password_hash(payload.new_password)
    reset_token.used = True
    db.commit()

    return {"status": "success", "message": "Password has been reset successfully. You can now log in."}

