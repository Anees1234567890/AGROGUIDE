from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class Professional(Base):
    __tablename__ = "professionals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(150), default="Agricultural Extension Officer / Agronomist")
    expertise = Column(String(200), nullable=False)  # Soil Health, Pest Management, Organic Farming, Irrigation & Water, Plantation Crops
    institution = Column(String(200), default="Kerala Agricultural University (KAU) / Krishi Bhavan")
    location = Column(String(150), nullable=False)
    languages = Column(String(150), default="English, Malayalam, Hindi")
    experience_years = Column(Integer, default=8)
    bio = Column(Text, nullable=False)
    availability = Column(String(100), default="Mon - Fri (9:00 AM - 5:00 PM)")
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    support_requests = relationship("SupportRequest", back_populates="professional", cascade="all, delete-orphan")


class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    professional_id = Column(Integer, ForeignKey("professionals.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(200), default="Agricultural Consultation Request")
    crop_name = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    consultation_code = Column(String(50), nullable=True)
    suspected_disease = Column(String(200), nullable=True)
    treatment = Column(Text, nullable=True)
    preventive_measures = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, In Review, Responded
    response = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="support_requests_sent")
    professional = relationship("Professional", back_populates="support_requests")


