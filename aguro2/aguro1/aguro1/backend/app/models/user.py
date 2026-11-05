from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base
import secrets


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Farmer")  # Farmer, Agricultural Professional, Admin
    preferred_language = Column(String(10), default="en")  # en, ml, hi
    state = Column(String(100), default="Kerala")
    district = Column(String(100), default="Palakkad")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("CommunityPost", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    support_requests_sent = relationship("SupportRequest", foreign_keys="[SupportRequest.farmer_id]", back_populates="farmer")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    farm_histories = relationship("FarmHistory", back_populates="user", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_name = Column(String(100), default="My Primary Farm")
    farm_size = Column(Float, default=2.5)  # in acres
    soil_type = Column(String(100), default="Alluvial")  # Alluvial, Red, Black, Laterite, Clay, Sandy, Loamy
    soil_ph = Column(Float, default=6.5)
    irrigation_type = Column(String(100), default="Canal / River")  # Drip, Sprinkler, Rainfed, Canal / River, Borewell
    location = Column(String(150), default="Palakkad, Kerala")
    current_season = Column(String(50), default="Kharif")  # Kharif, Rabi, Zaid / Summer, Whole Year
    current_crops = Column(String(255), default="Rice, Banana")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="farms")


class FarmHistory(Base):
    __tablename__ = "farm_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=True)
    season = Column(String(100), nullable=False)  # e.g. "Kharif 2025", "Rabi 2024-25"
    crop_name = Column(String(150), nullable=False)  # e.g. "Rice (Paddy - Jyothi)"
    area_cultivated = Column(Float, default=1.0)  # in acres
    yield_harvested = Column(String(100), nullable=True)  # e.g. "4,200 kg"
    sowing_date = Column(String(50), nullable=True)  # e.g. "June 2025"
    harvest_date = Column(String(50), nullable=True)  # e.g. "October 2025"
    fertilizers_used = Column(String(255), nullable=True)
    pest_issues = Column(String(255), nullable=True)
    revenue_earned = Column(Float, default=0.0)  # in INR
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="farm_histories")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")

