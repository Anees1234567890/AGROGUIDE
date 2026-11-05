from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
    crop_name = Column(String(100), nullable=False, index=True)
    market_name = Column(String(150), nullable=False, index=True)  # Mandi name, e.g. Palakkad APMC, Vashi Mandi, etc.
    location = Column(String(150), nullable=False)  # District, State
    price = Column(Float, nullable=False)  # Current modal price
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    unit = Column(String(50), default="₹/Quintal")
    trend = Column(String(20), default="up")  # up, down, stable
    trend_percentage = Column(Float, default=1.5)  # e.g. +2.4%
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source = Column(String(100), default="AGMARKNET / Kerala AgriMarket Feed")
    is_demo = Column(Boolean, default=True)

    crop = relationship("Crop", back_populates="market_prices")


class WeatherCache(Base):
    __tablename__ = "weather_cache"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location = Column(String(150), nullable=False, index=True)  # e.g. Palakkad, Kerala
    temperature = Column(Float, nullable=False)
    feels_like = Column(Float, nullable=True)
    temp_min = Column(Float, nullable=True)
    temp_max = Column(Float, nullable=True)
    humidity = Column(Float, nullable=False)
    rainfall_probability = Column(Float, default=10.0)
    wind_speed = Column(Float, default=8.0)
    condition = Column(String(100), default="Sunny / Clear")
    icon = Column(String(50), default="01d")
    forecast_data = Column(Text, nullable=True)  # JSON 5-day forecast
    advisory_alert = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

