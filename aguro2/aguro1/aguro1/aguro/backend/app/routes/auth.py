from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, Farm
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UserResponse,
    FarmUpdate,
    FarmResponse,
    Token,
)
from app.auth.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user

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

    # Validate role
    role = user_in.role if user_in.role in ["Farmer", "Agricultural Professional", "Admin"] else "Farmer"

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
    user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
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
