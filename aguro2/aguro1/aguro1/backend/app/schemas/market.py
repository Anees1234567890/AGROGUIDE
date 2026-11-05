from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class MarketPriceBase(BaseModel):
    crop_id: Optional[int] = None
    crop_name: str
    market_name: str
    location: str
    price: float
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    unit: Optional[str] = "₹/Quintal"
    trend: Optional[str] = "up"  # up, down, stable
    trend_percentage: Optional[float] = 1.5
    source: Optional[str] = "AGMARKNET / State Agri Board"
    is_demo: Optional[bool] = True


class MarketPriceCreate(MarketPriceBase):
    pass


class MarketPriceUpdate(BaseModel):
    crop_name: Optional[str] = None
    market_name: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    unit: Optional[str] = None
    trend: Optional[str] = None
    trend_percentage: Optional[float] = None
    recorded_at: Optional[datetime] = None


class MarketPriceResponse(MarketPriceBase):
    id: int
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarketPriceListResponse(BaseModel):
    total: int
    page: int
    limit: int
    is_demo_mode: bool
    notice: str
    items: List[MarketPriceResponse]
