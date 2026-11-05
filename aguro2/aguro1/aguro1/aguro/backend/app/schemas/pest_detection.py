from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class TreatmentPlan(BaseModel):
    organic_control: str
    chemical_control: str
    cultural_prevention: str
    spray_schedule: str


class PestScanRequest(BaseModel):
    crop_name: str = Field(default="Rice (Paddy)")
    plant_part: str = Field(default="Leaf")  # Leaf, Stem, Fruit, Root, Flower
    image_data: Optional[str] = None  # Base64 encoded or image URL
    observed_symptoms: Optional[str] = None
    sample_id: Optional[str] = None  # For instant test samples


class PestScanResponse(BaseModel):
    id: Optional[int] = None
    crop_name: str
    plant_part: str
    detected_disease: str
    scientific_name: Optional[str] = None
    pathogen_type: str
    confidence_score: float  # percentage e.g. 96.4
    severity: str  # Mild, Moderate, High, Severe
    severity_score: int  # 1 to 10
    image_url: Optional[str] = None
    symptoms_matched: List[str] = []
    treatment_plan: TreatmentPlan
    immediate_action: str
    disclaimer: str = "AgroGuide AI Pest Scanner provides computer vision advisory estimations. For quarantine-grade verification, consult your local Krishi Bhavan."
    scanned_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SampleScanItem(BaseModel):
    id: str
    crop_name: str
    disease_name: str
    plant_part: str
    thumbnail_url: str
    description: str
