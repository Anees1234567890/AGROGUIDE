from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base


class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    packaging_type = Column(String(50), default="Jute Bags")  # Jute Bags, Plastic Crates, Corrugated Boxes, Bulk
    harvest_date = Column(String(50), nullable=True)
    pickup_address = Column(Text, nullable=False)
    pickup_district = Column(String(100), default="Palakkad")
    destination_mandi = Column(String(150), nullable=False)
    destination_address = Column(Text, nullable=False)
    distance_km = Column(Float, default=45.0)
    vehicle_type = Column(String(100), default="Eco Mini-Truck (1.5 Ton)")
    requires_cold_chain = Column(Boolean, default=False)
    estimated_cost = Column(Float, nullable=False)
    spoilage_risk = Column(String(50), default="Low")  # Low, Medium, High, Perishable
    transit_advisory = Column(Text, nullable=True)
    status = Column(String(50), default="Booked")  # Booked, Driver Assigned, Picked Up, In Transit, Delivered
    driver_name = Column(String(100), default="Suresh Kumar")
    driver_phone = Column(String(50), default="+91 94471 28901")
    vehicle_number = Column(String(50), default="KL-09-AX-4821")
    current_location = Column(String(150), default="En Route to APMC Mandi")
    delivery_partner = Column(String(150), default="AgroExpress Logistics Hub")
    partner_rating = Column(Float, default=4.9)
    estimated_delivery_time = Column(String(100), nullable=True)
    payment_status = Column(String(50), default="Pending Payment")
    payment_method = Column(String(50), nullable=True)
    payment_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    delivered_at = Column(DateTime, nullable=True)

    farmer = relationship("User", backref="delivery_orders")
