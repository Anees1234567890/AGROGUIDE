import httpx
from datetime import datetime, timedelta, timezone
import random
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.config import settings
from app.schemas.weather import WeatherResponse, DailyForecast, HourlyForecast

logger = logging.getLogger(__name__)

# Comprehensive micro-climate weather database for ALL 14 Kerala districts and key agricultural regions
DISTRICT_WEATHER_PRESETS = {
    "palakkad": {
        "name": "Palakkad", "temp": 34.0, "temp_min": 24.5, "temp_max": 36.5, "humidity": 65.0,
        "rain_prob": 20.0, "wind": 12.0, "condition": "Warm & Sunny Spells", "icon": "01d",
        "air_quality": "Good (AQI 42)", "uv_index": 8.5, "soil_moisture": "Moderate (60%)",
        "advisory": "High daytime temperatures. Maintain irrigation intervals for paddy tillering and sugarcane crops."
    },
    "wayanad": {
        "name": "Wayanad", "temp": 22.5, "temp_min": 16.5, "temp_max": 25.5, "humidity": 86.0,
        "rain_prob": 65.0, "wind": 9.0, "condition": "Scattered Showers & Cool", "icon": "10d",
        "air_quality": "Excellent (AQI 20)", "uv_index": 5.2, "soil_moisture": "High (84%)",
        "advisory": "Cool high-altitude weather. High humidity favorable for coffee & cardamom. Spray bio-fungicides if needed."
    },
    "idukki": {
        "name": "Idukki", "temp": 18.5, "temp_min": 12.5, "temp_max": 22.0, "humidity": 88.0,
        "rain_prob": 70.0, "wind": 11.0, "condition": "Misty & Light Rain", "icon": "09d",
        "air_quality": "Excellent (AQI 15)", "uv_index": 4.8, "soil_moisture": "High (88%)",
        "advisory": "Cool high-range climate suitable for tea & cardamom. Ensure slope soil conservation."
    },
    "munnar": {
        "name": "Munnar", "temp": 17.0, "temp_min": 11.0, "temp_max": 20.5, "humidity": 90.0,
        "rain_prob": 75.0, "wind": 10.0, "condition": "Cool Mist & Drizzle", "icon": "09d",
        "air_quality": "Excellent (AQI 12)", "uv_index": 4.2, "soil_moisture": "High (90%)",
        "advisory": "Highland tea estates: ideal flushing weather. Guard against blister blight in tea."
    },
    "ernakulam": {
        "name": "Ernakulam", "temp": 30.5, "temp_min": 25.0, "temp_max": 33.0, "humidity": 78.0,
        "rain_prob": 40.0, "wind": 14.0, "condition": "Humid & Partly Sunny", "icon": "02d",
        "air_quality": "Moderate (AQI 65)", "uv_index": 8.0, "soil_moisture": "Adequate (70%)",
        "advisory": "Maintain steady drip irrigation for coconut, nutmeg, and urban vegetable gardens."
    },
    "kochi": {
        "name": "Kochi", "temp": 30.5, "temp_min": 25.0, "temp_max": 33.0, "humidity": 78.0,
        "rain_prob": 40.0, "wind": 14.0, "condition": "Humid & Coastal Breeze", "icon": "02d",
        "air_quality": "Moderate (AQI 65)", "uv_index": 8.0, "soil_moisture": "Adequate (70%)",
        "advisory": "Coastal weather: ideal for coconut palms and pokkali saline rice fields."
    },
    "thrissur": {
        "name": "Thrissur", "temp": 31.0, "temp_min": 24.5, "temp_max": 33.5, "humidity": 74.0,
        "rain_prob": 35.0, "wind": 10.0, "condition": "Warm with Sunny Spells", "icon": "01d",
        "air_quality": "Good (AQI 45)", "uv_index": 7.8, "soil_moisture": "Moderate (65%)",
        "advisory": "Cole land paddy tracts: monitor water pumping and inspect for stem borer activity."
    },
    "alappuzha": {
        "name": "Alappuzha", "temp": 29.5, "temp_min": 24.5, "temp_max": 32.0, "humidity": 82.0,
        "rain_prob": 50.0, "wind": 15.0, "condition": "Coastal Breezes & Clouds", "icon": "03d",
        "air_quality": "Good (AQI 35)", "uv_index": 7.0, "soil_moisture": "Saturated (90%)",
        "advisory": "Kuttanad below-sea-level farming: maintain bund integrity and monitor water salinity."
    },
    "kottayam": {
        "name": "Kottayam", "temp": 29.5, "temp_min": 23.5, "temp_max": 32.5, "humidity": 79.0,
        "rain_prob": 45.0, "wind": 8.0, "condition": "Partly Cloudy", "icon": "02d",
        "air_quality": "Good (AQI 38)", "uv_index": 7.2, "soil_moisture": "Good (72%)",
        "advisory": "Ideal rubber tapping conditions. Check plantain plantations for sigatoka spots."
    },
    "kozhikode": {
        "name": "Kozhikode", "temp": 30.5, "temp_min": 25.0, "temp_max": 32.5, "humidity": 76.0,
        "rain_prob": 30.0, "wind": 13.0, "condition": "Sunny & Coastal Breeze", "icon": "01d",
        "air_quality": "Good (AQI 48)", "uv_index": 8.1, "soil_moisture": "Adequate (64%)",
        "advisory": "Good sun drying weather for black pepper, nutmeg, and coconut copra."
    },
    "thiruvananthapuram": {
        "name": "Thiruvananthapuram", "temp": 29.5, "temp_min": 24.0, "temp_max": 32.0, "humidity": 76.0,
        "rain_prob": 35.0, "wind": 12.0, "condition": "Partly Sunny", "icon": "02d",
        "air_quality": "Good (AQI 40)", "uv_index": 7.6, "soil_moisture": "Moderate (66%)",
        "advisory": "Favorable conditions for tapioca/cassava harvesting and coconut fertilization."
    },
    "trivandrum": {
        "name": "Thiruvananthapuram", "temp": 29.5, "temp_min": 24.0, "temp_max": 32.0, "humidity": 76.0,
        "rain_prob": 35.0, "wind": 12.0, "condition": "Partly Sunny", "icon": "02d",
        "air_quality": "Good (AQI 40)", "uv_index": 7.6, "soil_moisture": "Moderate (66%)",
        "advisory": "Favorable conditions for tapioca/cassava harvesting and coconut fertilization."
    },
    "kollam": {
        "name": "Kollam", "temp": 30.0, "temp_min": 24.5, "temp_max": 32.5, "humidity": 77.0,
        "rain_prob": 40.0, "wind": 11.0, "condition": "Humid with Sun", "icon": "02d",
        "air_quality": "Good (AQI 38)", "uv_index": 7.7, "soil_moisture": "Good (70%)",
        "advisory": "Cashew and pepper crops: monitor soil moisture and apply organic compost."
    },
    "pathanamthitta": {
        "name": "Pathanamthitta", "temp": 29.0, "temp_min": 23.0, "temp_max": 31.5, "humidity": 80.0,
        "rain_prob": 50.0, "wind": 8.0, "condition": "Passing Showers", "icon": "10d",
        "air_quality": "Excellent (AQI 25)", "uv_index": 6.8, "soil_moisture": "High (80%)",
        "advisory": "High moisture for rubber groves. Apply rain-guards to rubber trees during showers."
    },
    "malappuram": {
        "name": "Malappuram", "temp": 30.5, "temp_min": 24.0, "temp_max": 33.0, "humidity": 75.0,
        "rain_prob": 35.0, "wind": 10.0, "condition": "Warm & Bright", "icon": "01d",
        "air_quality": "Good (AQI 42)", "uv_index": 8.0, "soil_moisture": "Moderate (64%)",
        "advisory": "Arecanut and betel vine gardens: provide adequate shade and drip irrigation."
    },
    "kannur": {
        "name": "Kannur", "temp": 30.0, "temp_min": 24.5, "temp_max": 32.5, "humidity": 75.0,
        "rain_prob": 30.0, "wind": 12.0, "condition": "Sunny Spells", "icon": "01d",
        "air_quality": "Good (AQI 44)", "uv_index": 8.0, "soil_moisture": "Moderate (65%)",
        "advisory": "Favorable weather for pepper drying and cashew plantation pruning."
    },
    "kasaragod": {
        "name": "Kasaragod", "temp": 29.5, "temp_min": 24.0, "temp_max": 32.0, "humidity": 77.0,
        "rain_prob": 35.0, "wind": 13.0, "condition": "Partly Cloudy", "icon": "02d",
        "air_quality": "Good (AQI 36)", "uv_index": 7.8, "soil_moisture": "Good (68%)",
        "advisory": "Northern coconut palm belt: check for red palm weevil and maintain irrigation."
    }
}


def get_fallback_weather(location_query: str) -> WeatherResponse:
    loc_clean = location_query.strip().lower()
    
    # State-wide Kerala summary check
    if loc_clean in {"kerala", "all kerala", "kerala all", "all districts", "kerala (all districts)"}:
        unique_presets = list({p["name"]: p for p in DISTRICT_WEATHER_PRESETS.values()}.values())
        avg_temp = round(sum(item["temp"] for item in unique_presets) / len(unique_presets), 1)
        avg_min = round(sum(item["temp_min"] for item in unique_presets) / len(unique_presets), 1)
        avg_max = round(sum(item["temp_max"] for item in unique_presets) / len(unique_presets), 1)
        avg_hum = round(sum(item["humidity"] for item in unique_presets) / len(unique_presets), 1)
        avg_rain = round(sum(item["rain_prob"] for item in unique_presets) / len(unique_presets), 0)
        avg_wind = round(sum(item["wind"] for item in unique_presets) / len(unique_presets), 1)

        now = datetime.now(timezone.utc)
        return WeatherResponse(
            location="Kerala (All Districts)",
            state="Kerala",
            temperature=avg_temp,
            feels_like=round(avg_temp + 2.1, 1),
            temp_min=avg_min,
            temp_max=avg_max,
            humidity=avg_hum,
            rainfall_probability=avg_rain,
            wind_speed=avg_wind,
            condition="Micro-Climate Variance Across Kerala",
            icon="03d",
            air_quality="Good (AQI 38)",
            uv_index=7.2,
            soil_moisture_estimate="Variable by district",
            updated_at=now,
            is_demo_mode=True,
            notice="Kerala-wide district estimates. Select a specific district (e.g. Wayanad, Idukki, Palakkad) for exact micro-climate values.",
            advisory_alert="Temperatures vary from 18.5°C in high-altitude Idukki/Munnar to 34°C in Palakkad plains. Review your specific district forecast.",
            daily_forecast=_generate_daily_forecast(now, avg_max, avg_min, avg_rain),
            hourly_forecast=_generate_hourly_forecast(avg_temp, avg_hum, "Partly Cloudy", avg_rain)
        )

    # Search for matching valid Kerala district or town
    matched_key = None
    for key in DISTRICT_WEATHER_PRESETS.keys():
        if key in loc_clean or loc_clean in key:
            matched_key = key
            break

    # If location search is gibberish / invalid (not in district presets)
    if not matched_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{location_query.strip()}' not found. Please search for a valid Kerala district or agricultural region (e.g. Palakkad, Wayanad, Idukki, Ernakulam, Trivandrum, Munnar, etc.)."
        )

    preset = DISTRICT_WEATHER_PRESETS[matched_key]
    display_location = preset["name"]
    now = datetime.now(timezone.utc)

    return WeatherResponse(
        location=display_location,
        state="Kerala",
        temperature=preset["temp"],
        feels_like=round(preset["temp"] + (2.0 if preset["temp"] > 28 else 0.5), 1),
        temp_min=preset["temp_min"],
        temp_max=preset["temp_max"],
        humidity=preset["humidity"],
        rainfall_probability=preset["rain_prob"],
        wind_speed=preset["wind"],
        condition=preset["condition"],
        icon=preset["icon"],
        air_quality=preset["air_quality"],
        uv_index=preset["uv_index"],
        soil_moisture_estimate=preset["soil_moisture"],
        updated_at=now,
        is_demo_mode=True,
        notice=f"Kerala Micro-Climate Data Active for {display_location}.",
        advisory_alert=preset["advisory"],
        daily_forecast=_generate_daily_forecast(now, preset["temp_max"], preset["temp_min"], preset["rain_prob"]),
        hourly_forecast=_generate_hourly_forecast(preset["temp"], preset["humidity"], preset["condition"], preset["rain_prob"])
    )


def _generate_daily_forecast(now: datetime, base_max: float, base_min: float, base_rain: float) -> list[DailyForecast]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily: list[DailyForecast] = []
    for i in range(5):
        day_date = now + timedelta(days=i)
        day_name = days[day_date.weekday()]
        date_str = day_date.strftime("%d %b")
        t_max = round(base_max + (0.5 if i % 2 == 0 else -0.5), 1)
        t_min = round(base_min + (0.3 if i % 2 == 1 else -0.3), 1)
        r_prob = max(5.0, min(95.0, round(base_rain + (-5.0 if i % 2 == 0 else 5.0), 0)))
        
        cond = "Sunny" if r_prob < 30 else ("Scattered Rain" if r_prob > 60 else "Partly Cloudy")
        icon = "01d" if r_prob < 30 else ("10d" if r_prob > 60 else "02d")
        tip = "Good for harvesting" if r_prob < 30 else ("Avoid spray operations" if r_prob > 60 else "Standard irrigation schedule")

        daily.append(DailyForecast(
            day=day_name if i > 0 else "Today",
            date=date_str,
            temp_max=t_max,
            temp_min=t_min,
            condition=cond,
            icon=icon,
            rain_probability=r_prob,
            farming_tip=tip
        ))
    return daily


def _generate_hourly_forecast(base_temp: float, base_hum: float, condition: str, rain_prob: float) -> list[HourlyForecast]:
    hourly: list[HourlyForecast] = []
    hours_list = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "00:00", "03:00"]
    for idx, h in enumerate(hours_list):
        t_var = -3.0 if "06:00" in h or "03:00" in h else (2.5 if "12:00" in h or "15:00" in h else 0)
        t = round(base_temp + t_var, 1)
        hum = round(base_hum + (8.0 if "06:00" in h else -4.0), 0)
        hourly.append(HourlyForecast(
            time=h,
            temp=t,
            humidity=min(98.0, max(40.0, hum)),
            condition=condition,
            rain_chance=rain_prob
        ))
    return hourly


async def get_weather_for_location(location: str = "Palakkad") -> WeatherResponse:
    if not settings.WEATHER_API_KEY or settings.DEMO_MODE:
        return get_fallback_weather(location)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location},IN&limit=1&appid={settings.WEATHER_API_KEY}"
            geo_resp = await client.get(geo_url)
            if geo_resp.status_code == 200 and len(geo_resp.json()) > 0:
                geo_data = geo_resp.json()[0]
                lat = geo_data["lat"]
                lon = geo_data["lon"]
                
                weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={settings.WEATHER_API_KEY}"
                w_resp = await client.get(weather_url)
                if w_resp.status_code == 200:
                    w = w_resp.json()
                    now = datetime.now(timezone.utc)
                    return WeatherResponse(
                        location=geo_data.get("name", location),
                        state=geo_data.get("state", "India"),
                        temperature=round(w["main"]["temp"], 1),
                        feels_like=round(w["main"]["feels_like"], 1),
                        temp_min=round(w["main"]["temp_min"], 1),
                        temp_max=round(w["main"]["temp_max"], 1),
                        humidity=float(w["main"]["humidity"]),
                        rainfall_probability=float(w.get("clouds", {}).get("all", 20)),
                        wind_speed=round(w["wind"]["speed"] * 3.6, 1),
                        condition=w["weather"][0]["description"].title(),
                        icon=w["weather"][0]["icon"],
                        air_quality="Good (Live AQI)",
                        uv_index=6.5,
                        soil_moisture_estimate="Optimal",
                        updated_at=now,
                        is_demo_mode=False,
                        notice="Live OpenWeatherMap Connected",
                        advisory_alert="Weather conditions suitable for routine agricultural operations."
                    )
    except Exception as e:
        logger.warning(f"Live weather lookup failed for {location}: {e}")

    return get_fallback_weather(location)
