from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class FarmBase(BaseModel):
    farm_name: Optional[str] = "My Primary Farm"
    farm_size: Optional[float] = 2.5
    soil_type: Optional[str] = "Alluvial"
    soil_ph: Optional[float] = 6.5
    irrigation_type: Optional[str] = "Canal / River"
    location: Optional[str] = "Palakkad, Kerala"
    current_season: Optional[str] = "Kharif"
    current_crops: Optional[str] = "Rice, Banana"


class FarmCreate(FarmBase):
    pass


class FarmUpdate(FarmBase):
    pass


class FarmResponse(FarmBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmHistoryCreate(BaseModel):
    season: str
    crop_name: str
    area_cultivated: Optional[float] = 1.0
    yield_harvested: Optional[str] = None
    sowing_date: Optional[str] = None
    harvest_date: Optional[str] = None
    fertilizers_used: Optional[str] = None
    pest_issues: Optional[str] = None
    revenue_earned: Optional[float] = 0.0
    notes: Optional[str] = None


class FarmHistoryResponse(BaseModel):
    id: int
    user_id: int
    season: str
    crop_name: str
    area_cultivated: Optional[float] = None
    yield_harvested: Optional[str] = None
    sowing_date: Optional[str] = None
    harvest_date: Optional[str] = None
    fertilizers_used: Optional[str] = None
    pest_issues: Optional[str] = None
    revenue_earned: Optional[float] = 0.0
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "Farmer"
    preferred_language: Optional[str] = "en"
    state: Optional[str] = "Kerala"
    district: Optional[str] = "Palakkad"


class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    admin_access_key: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    farms: List[FarmResponse] = []

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class OTPRequest(BaseModel):
    email_or_phone: str
    purpose: Optional[str] = "register"


class OTPVerify(BaseModel):
    email_or_phone: str
    otp_code: str


class OTPLogin(BaseModel):
    email_or_phone: str
    otp_code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

