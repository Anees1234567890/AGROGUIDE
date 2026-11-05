from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ProfessionalBase(BaseModel):
    name: str
    designation: Optional[str] = "Agronomist / Agricultural Officer"
    expertise: str
    institution: Optional[str] = "Kerala Agricultural University / Krishi Bhavan"
    location: str
    languages: Optional[str] = "English, Malayalam, Hindi"
    experience_years: Optional[int] = 8
    bio: str
    availability: Optional[str] = "Mon - Fri (9:00 AM - 5:00 PM)"
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_verified: Optional[bool] = True


class ProfessionalCreate(ProfessionalBase):
    user_id: Optional[int] = None


class ProfessionalResponse(ProfessionalBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportRequestCreate(BaseModel):
    professional_id: Optional[int] = None
    subject: str = Field(default="Crop Disease Consultation")
    crop_name: Optional[str] = None
    message: str = Field(..., min_length=5)
    image_url: Optional[str] = None


class SupportRequestResponseUpdate(BaseModel):
    response: str = Field(..., min_length=3)
    status: Optional[str] = "Responded"
    suspected_disease: Optional[str] = None
    treatment: Optional[str] = None
    preventive_measures: Optional[str] = None


class SupportRequestResponse(BaseModel):
    id: int
    consultation_code: Optional[str] = None
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_district: Optional[str] = None
    professional_id: int
    subject: str
    crop_name: Optional[str] = None
    message: str
    image_url: Optional[str] = None
    suspected_disease: Optional[str] = None
    treatment: Optional[str] = None
    preventive_measures: Optional[str] = None
    status: str
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: datetime
    professional: Optional[ProfessionalResponse] = None

    model_config = ConfigDict(from_attributes=True)



