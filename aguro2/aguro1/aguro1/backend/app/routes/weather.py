from fastapi import APIRouter, Query
from app.schemas.weather import WeatherResponse
from app.services.weather_service import get_weather_for_location

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("", response_model=WeatherResponse)
async def get_weather(
    location: str = Query("Palakkad", description="District or city name (e.g. Palakkad, Wayanad, Idukki, Thrissur)")
):
    return await get_weather_for_location(location=location)
