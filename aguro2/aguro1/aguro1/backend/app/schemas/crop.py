from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class PestBase(BaseModel):
    crop_id: Optional[int] = None
    crop_name: Optional[str] = None
    name: str
    symptoms: str
    possible_causes: Optional[str] = None
    prevention: str
    management: str
    professional_guidance: Optional[str] = "Consult local agricultural extension officer for regulated biological/chemical interventions."


class PestCreate(PestBase):
    pass


class PestResponse(PestBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DiseaseBase(BaseModel):
    crop_id: Optional[int] = None
    crop_name: Optional[str] = None
    name: str
    symptoms: str
    possible_causes: Optional[str] = None
    prevention: str
    management: str
    professional_guidance: Optional[str] = "Consult certified agronomist for certified eco-friendly fungicides."


class DiseaseCreate(DiseaseBase):
    pass


class DiseaseResponse(DiseaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CropBase(BaseModel):
    name: str
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: str
    suitable_soil: str
    ph_min: Optional[float] = 5.5
    ph_max: Optional[float] = 7.5
    suitable_season: str
    temperature_min: Optional[float] = 20.0
    temperature_max: Optional[float] = 35.0
    water_requirement: Optional[str] = "Medium"
    rainfall_min: Optional[float] = 500.0
    rainfall_max: Optional[float] = 2500.0
    duration: Optional[str] = "90 - 120 days"
    irrigation_requirement: Optional[str] = "Moderate irrigation at critical growth stages"
    sowing_info: Optional[str] = None
    harvest_info: Optional[str] = None
    cultivation_info: str
    image_url: Optional[str] = None
    market_unit: Optional[str] = "₹/Quintal"
    expected_yield: Optional[str] = "20-30 Quintals/Acre"


class CropCreate(CropBase):
    pass


class CropUpdate(BaseModel):
    name: Optional[str] = None
    local_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    suitable_soil: Optional[str] = None
    ph_min: Optional[float] = None
    ph_max: Optional[float] = None
    suitable_season: Optional[str] = None
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None
    water_requirement: Optional[str] = None
    rainfall_min: Optional[float] = None
    rainfall_max: Optional[float] = None
    duration: Optional[str] = None
    irrigation_requirement: Optional[str] = None
    sowing_info: Optional[str] = None
    harvest_info: Optional[str] = None
    cultivation_info: Optional[str] = None
    image_url: Optional[str] = None
    market_unit: Optional[str] = None
    expected_yield: Optional[str] = None


class CropResponse(CropBase):
    id: int
    created_at: datetime
    pests: List[PestResponse] = []
    diseases: List[DiseaseResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CropListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    crops: List[CropResponse]
