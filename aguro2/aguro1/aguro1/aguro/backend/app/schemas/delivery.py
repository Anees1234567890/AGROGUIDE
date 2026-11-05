from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class DeliveryQuoteRequest(BaseModel):
    crop_name: str
    quantity_quintals: float = Field(..., gt=0)
    distance_km: float = Field(..., gt=0)
    vehicle_type: str = "Eco Mini-Truck (1.5 Ton)"
    requires_cold_chain: bool = False


class DeliveryQuoteResponse(BaseModel):
    crop_name: str
    quantity_quintals: float
    distance_km: float
    vehicle_type: str
    base_freight: float
    loading_charges: float
    cold_chain_surcharge: float
    total_estimated_cost: float
    spoilage_risk: str
    transit_advisory: str
    estimated_transit_hours: float
    delivery_partner: str = "AgroExpress Logistics Hub"
    partner_rating: float = 4.9
    estimated_delivery_time: str


class DeliveryOrderCreate(BaseModel):
    crop_name: str
    quantity_quintals: float = Field(..., gt=0)
    packaging_type: str = "Jute Bags"
    harvest_date: Optional[str] = None
    pickup_address: str = Field(..., min_length=5)
    pickup_district: str = "Palakkad"
    destination_mandi: str = "Palakkad APMC Mandi"
    destination_address: str = "Main APMC Yard, Palakkad"
    distance_km: float = 35.0
    vehicle_type: str = "Eco Mini-Truck (1.5 Ton)"
    requires_cold_chain: bool = False


class DeliveryOrderUpdate(BaseModel):
    status: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    current_location: Optional[str] = None


class DeliveryOrderResponse(BaseModel):
    id: int
    user_id: int
    tracking_number: str
    crop_name: str
    quantity_quintals: float
    packaging_type: str
    harvest_date: Optional[str]
    pickup_address: str
    pickup_district: str
    destination_mandi: str
    destination_address: str
    distance_km: float
    vehicle_type: str
    requires_cold_chain: bool
    estimated_cost: float
    spoilage_risk: str
    transit_advisory: Optional[str]
    status: str
    driver_name: str
    driver_phone: str
    vehicle_number: str
    current_location: str
    delivery_partner: str
    partner_rating: float
    estimated_delivery_time: Optional[str] = None
    payment_status: str
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    created_at: datetime
    delivered_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DeliveryPaymentRequest(BaseModel):
    payment_method: str = Field(..., pattern="^(UPI|Card|Net Banking|Cash)$")


class ConsignmentGatePass(BaseModel):
    gate_pass_id: str
    tracking_number: str
    farmer_name: str
    farmer_phone: Optional[str]
    crop_name: str
    quantity_quintals: float
    packaging_type: str
    destination_mandi: str
    vehicle_number: str
    driver_name: str
    driver_phone: str
    dispatch_timestamp: str
    status: str
    qr_code_payload: str
