from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class PestScanRecord(Base):
    __tablename__ = "pest_scan_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    crop_name = Column(String(100), nullable=False, index=True)
    plant_part = Column(String(50), default="Leaf")  # Leaf, Stem, Fruit, Root, Flower, Whole Plant
    image_url = Column(Text, nullable=True)
    detected_disease = Column(String(150), nullable=False, index=True)
    scientific_name = Column(String(150), nullable=True)
    pathogen_type = Column(String(50), default="Fungal")  # Fungal, Bacterial, Viral, Insect/Pest, Deficiency
    confidence_score = Column(Float, nullable=False)  # 0.0 to 100.0
    severity = Column(String(50), default="Moderate")  # Mild, Moderate, High, Severe
    symptoms = Column(Text, nullable=False)
    organic_treatment = Column(Text, nullable=False)
    chemical_treatment = Column(Text, nullable=False)
    cultural_control = Column(Text, nullable=False)
    action_plan = Column(Text, nullable=True)
    scanned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref="pest_scans")
