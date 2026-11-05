from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


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

