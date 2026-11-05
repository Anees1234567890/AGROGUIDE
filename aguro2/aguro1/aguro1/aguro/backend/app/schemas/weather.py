from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DailyForecast(BaseModel):
    day: str
    date: str
    temp_max: float
    temp_min: float
    condition: str
    icon: str
    rain_probability: float
    farming_tip: str


class HourlyForecast(BaseModel):
    time: str
    temp: float
    humidity: float
    condition: str
    rain_chance: float


class WeatherResponse(BaseModel):
    location: str
    state: str
    temperature: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: float
    rainfall_probability: float
    wind_speed: float
    condition: str
    icon: str
    air_quality: str
    uv_index: float
    soil_moisture_estimate: str
    updated_at: datetime
    is_demo_mode: bool
    notice: str
    advisory_alert: Optional[str] = None
    daily_forecast: List[DailyForecast] = []
    hourly_forecast: List[HourlyForecast] = []
