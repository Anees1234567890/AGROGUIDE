from pydantic import BaseModel, Field
from typing import Optional, List, Union


class DiseaseScanRejectionResponse(BaseModel):
    status: str = Field(default="REJECTED")
    error_code: str = Field(..., example="INVALID_IMAGE_DOMAIN")
    is_valid_crop_leaf: bool = Field(default=False)
    confidence_score: float = Field(default=0.0)
    user_message: str


class DiseaseScanSuccessResponse(BaseModel):
    status: str = Field(default="SUCCESS")
    is_valid_crop_leaf: bool = Field(default=True)
    crop: str
    disease: str
    confidence_score: str  # e.g., "92.5%"
    severity: str  # e.g., "Moderate"
    next_steps: List[str]


class DiseaseScanResult(BaseModel):
    __root__: Union[DiseaseScanSuccessResponse, DiseaseScanRejectionResponse]
