from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    local_name = Column(String(150), nullable=True)  # Malayalam / Hindi local names
    scientific_name = Column(String(150), nullable=True)
    category = Column(String(100), nullable=False, index=True)  # Cereals, Pulses, Vegetables, Fruits, Spices, Oilseeds, Plantation Crops, Commercial Crops
    suitable_soil = Column(String(200), nullable=False)  # Alluvial, Red, Black, Laterite, Clay, Loamy, Sandy
    ph_min = Column(Float, default=5.5)
    ph_max = Column(Float, default=7.5)
    suitable_season = Column(String(100), nullable=False)  # Kharif, Rabi, Zaid, Whole Year
    temperature_min = Column(Float, default=20.0)  # Celsius
    temperature_max = Column(Float, default=35.0)  # Celsius
    water_requirement = Column(String(50), default="Medium")  # Low, Medium, High, Very High
    rainfall_min = Column(Float, default=500.0)  # mm
    rainfall_max = Column(Float, default=2500.0)  # mm
    duration = Column(String(100), default="90 - 120 days")
    irrigation_requirement = Column(String(150), default="Moderate irrigation at critical growth stages")
    sowing_info = Column(Text, nullable=True)
    harvest_info = Column(Text, nullable=True)
    cultivation_info = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    market_unit = Column(String(50), default="₹/Quintal")
    expected_yield = Column(String(100), default="20-30 Quintals/Acre")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    pests = relationship("CropPest", back_populates="crop", cascade="all, delete-orphan")
    diseases = relationship("CropDisease", back_populates="crop", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="crop", cascade="all, delete-orphan")
    market_prices = relationship("MarketPrice", back_populates="crop", cascade="all, delete-orphan")


class CropPest(Base):
    __tablename__ = "crop_pests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=True)
    crop_name = Column(String(100), nullable=True)  # For generic or multi-crop pests
    name = Column(String(150), nullable=False, index=True)
    symptoms = Column(Text, nullable=False)
    possible_causes = Column(Text, nullable=True)
    prevention = Column(Text, nullable=False)
    management = Column(Text, nullable=False)
    professional_guidance = Column(Text, default="Consult local Krishi Bhavan or agricultural extension officer for regulated biological/chemical interventions.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    crop = relationship("Crop", back_populates="pests")


class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=True)
    crop_name = Column(String(100), nullable=True)
    name = Column(String(150), nullable=False, index=True)
    symptoms = Column(Text, nullable=False)
    possible_causes = Column(Text, nullable=True)
    prevention = Column(Text, nullable=False)
    management = Column(Text, nullable=False)
    professional_guidance = Column(Text, default="Consult agricultural university advisory or certified agronomist for certified fungicides/treatments.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    crop = relationship("Crop", back_populates="diseases")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # 0 to 100
    suitability_level = Column(String(50), default="Highly Suitable")  # Highly Suitable, Moderately Suitable, Marginal
    reason = Column(Text, nullable=False)
    breakdown = Column(Text, nullable=True)  # JSON string of sub-scores
    soil_suitability = Column(String(100), default="High Match")
    season_suitability = Column(String(100), default="Optimal")
    water_suitability = Column(String(100), default="Adequate")
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="recommendations")
    crop = relationship("Crop", back_populates="recommendations")

