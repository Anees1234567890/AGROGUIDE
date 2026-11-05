from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.crop import CropResponse


class RecommendationRequest(BaseModel):
    state: str = Field(default="Kerala")
    district: str = Field(default="Palakkad")
    soil_type: str = Field(default="Alluvial")  # Alluvial, Red, Black, Laterite, Clay, Sandy, Loamy, Peaty / Kari, Forest Loamy, Coastal Sand
    soil_ph: Optional[float] = Field(default=6.5, ge=3.5, le=10.0)
    season: Optional[str] = Field(default=None)
    farm_size: Optional[float] = Field(default=2.5)  # acres
    irrigation_availability: str = Field(default="Canal / River")  # Canal / River, Drip, Sprinkler, Rainfed, Borewell
    disaster_impact: Optional[str] = Field(default="Normal (No Recent Disaster)")  # Post-Flood Siltation & Waterlogging, Landslide & Erosion, Coastal Salinity Intrusion, Drought
    previous_crop: Optional[str] = Field(default="None")
    nitrogen_n: Optional[float] = Field(default=None)
    phosphorus_p: Optional[float] = Field(default=None)
    potassium_k: Optional[float] = Field(default=None)



class SuitabilityFactor(BaseModel):
    factor: str
    score: float
    max_score: float
    status: str
    detail: str


class RecommendationItem(BaseModel):
    crop: CropResponse
    score: float  # 0 to 100
    suitability_level: str  # Highly Suitable, Moderately Suitable, Marginal
    match_percentage: int
    why_recommended: str
    soil_suitability: str
    season_suitability: str
    water_suitability: str
    rotation_benefit: Optional[str] = None
    disaster_advisory: Optional[str] = None
    factors: List[SuitabilityFactor] = []


class RecommendationResponse(BaseModel):
    total_evaluated: int
    recommendations: List[RecommendationItem]
    query_summary: Dict[str, Any]
    disclaimer: str = "AgroGuide recommendations are rule-based advisory estimates and not scientific guarantees. Confirm with your local agricultural officer."


class RecommendationHistoryResponse(BaseModel):
    id: int
    crop_id: int
    crop_name: str
    score: float
    suitability_level: str
    reason: str
    state: Optional[str]
    district: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

