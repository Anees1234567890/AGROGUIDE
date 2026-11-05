from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import random
from sqlalchemy.orm import Session
from app.models.delivery import DeliveryOrder
from app.models.user import User
from app.schemas.delivery import (
    DeliveryQuoteRequest,
    DeliveryQuoteResponse,
    DeliveryOrderCreate,
    DeliveryOrderUpdate,
    DeliveryOrderResponse,
    ConsignmentGatePass,
    DeliveryPaymentRequest,
)

VEHICLE_RATES = {
    "Eco Mini-Truck (1.5 Ton)": {"rate_per_km": 18.0, "base_fee": 350.0, "max_capacity": 15.0},
    "Light Commercial Truck (3.5 Ton)": {"rate_per_km": 28.0, "base_fee": 650.0, "max_capacity": 35.0},
    "Refrigerated Reefer Van (4.0 Ton)": {"rate_per_km": 38.0, "base_fee": 1100.0, "max_capacity": 40.0},
    "Tractor Trolley (Agri-Haul 5.0 Ton)": {"rate_per_km": 15.0, "base_fee": 400.0, "max_capacity": 50.0}
}

PERISHABILITY_RULES = {
    "tomato": {"risk": "Perishable", "hours": 24.0, "advisory": "Maintain 12-15°C temperature. Avoid stacking crates more than 4 tiers high to prevent bruising."},
    "banana": {"risk": "Perishable", "hours": 48.0, "advisory": "Transport in well-ventilated crates/hangers. Ensure protection against direct afternoon sunlight."},
    "green chilli": {"risk": "High", "hours": 36.0, "advisory": "Keep ventilated to avoid moisture buildup and rotting."},
    "black pepper": {"risk": "Low", "hours": 120.0, "advisory": "Dry produce with moisture content < 11%. Store in double-layered jute bags."},
    "cardamom": {"risk": "Low", "hours": 120.0, "advisory": "Hermetically sealed polythene-lined gunny bags to retain green volatile aroma."},
    "rice": {"risk": "Low", "hours": 240.0, "advisory": "Standard moisture < 14%. Keep tarp cover ready for monsoon transit."},
    "ginger": {"risk": "Medium", "hours": 72.0, "advisory": "Avoid airtight polybags; pack in breathable mesh bags or wooden crates."},
    "turmeric": {"risk": "Low", "hours": 120.0, "advisory": "Cured rhizomes require dry moisture-free transit in clean burlap bags."},
    "tapioca": {"risk": "High", "hours": 36.0, "advisory": "Fresh tubers suffer vascular streaking within 48h. Deliver to factory/mandi within 24h of harvest."}
}

DRIVERS_POOL = [
    {"name": "Suresh Kumar (Demo)", "phone": "+91 98000 00001", "vehicle": "KL-09-AX-4821"},
    {"name": "Rajesh Nair (Demo)", "phone": "+91 98000 00002", "vehicle": "KL-08-BK-9120"},
    {"name": "Manoj Varghese (Demo)", "phone": "+91 98000 00003", "vehicle": "KL-07-CD-3304"},
    {"name": "Sunil Das (Demo)", "phone": "+91 98000 00004", "vehicle": "KL-10-EE-7762"}
]

DEFAULT_DELIVERY_PARTNER = "AgroExpress Logistics Hub"
DEFAULT_PARTNER_RATING = 4.9

IST = timezone(timedelta(hours=5, minutes=30))


def format_eta(transit_hours: float) -> str:
    now_ist = datetime.now(IST)
    arrival_ist = now_ist + timedelta(hours=transit_hours)
    formatted_date = arrival_ist.strftime("%d %b %Y, %I:%M %p")
    return f"{formatted_date} (~ {transit_hours} hrs)"


def calculate_delivery_quote(request: DeliveryQuoteRequest) -> DeliveryQuoteResponse:
    crop_clean = request.crop_name.lower()
    vehicle_info = VEHICLE_RATES.get(request.vehicle_type, VEHICLE_RATES["Eco Mini-Truck (1.5 Ton)"])
    
    # Distance cost
    base_freight = round(vehicle_info["base_fee"] + (request.distance_km * vehicle_info["rate_per_km"]), 2)
    loading_charges = round(request.quantity_quintals * 25.0, 2)  # ₹25 per quintal loading/unloading
    cold_chain_surcharge = round(request.distance_km * 8.0, 2) if request.requires_cold_chain else 0.0
    total = round(base_freight + loading_charges + cold_chain_surcharge, 2)

    # Perishability check
    p_info = {"risk": "Low", "hours": 72.0, "advisory": "Standard secure agricultural packaging."}
    for k, v in PERISHABILITY_RULES.items():
        if k in crop_clean:
            p_info = v
            break

    est_hours = round((request.distance_km / 35.0) + 1.0, 1)  # Avg 35 km/h + 1hr loading

    return DeliveryQuoteResponse(
        crop_name=request.crop_name,
        quantity_quintals=request.quantity_quintals,
        distance_km=request.distance_km,
        vehicle_type=request.vehicle_type,
        base_freight=base_freight,
        loading_charges=loading_charges,
        cold_chain_surcharge=cold_chain_surcharge,
        total_estimated_cost=total,
        spoilage_risk=p_info["risk"],
        transit_advisory=p_info["advisory"],
        estimated_transit_hours=est_hours,
        delivery_partner=DEFAULT_DELIVERY_PARTNER,
        partner_rating=DEFAULT_PARTNER_RATING,
        estimated_delivery_time=format_eta(est_hours),
    )


def create_delivery_order(db: Session, order_in: DeliveryOrderCreate, user_id: int) -> DeliveryOrder:
    quote_req = DeliveryQuoteRequest(
        crop_name=order_in.crop_name,
        quantity_quintals=order_in.quantity_quintals,
        distance_km=order_in.distance_km,
        vehicle_type=order_in.vehicle_type,
        requires_cold_chain=order_in.requires_cold_chain
    )
    quote = calculate_delivery_quote(quote_req)
    
    now = datetime.now(timezone.utc)
    tracking_num = f"AGD-{now.strftime('%Y')}-{random.randint(10000, 99999)}"
    driver = random.choice(DRIVERS_POOL)

    order = DeliveryOrder(
        user_id=user_id,
        tracking_number=tracking_num,
        crop_name=order_in.crop_name,
        quantity_quintals=order_in.quantity_quintals,
        packaging_type=order_in.packaging_type,
        harvest_date=order_in.harvest_date or now.strftime("%Y-%m-%d"),
        pickup_address=order_in.pickup_address,
        pickup_district=order_in.pickup_district,
        destination_mandi=order_in.destination_mandi,
        destination_address=order_in.destination_address,
        distance_km=order_in.distance_km,
        vehicle_type=order_in.vehicle_type,
        requires_cold_chain=order_in.requires_cold_chain,
        estimated_cost=quote.total_estimated_cost,
        spoilage_risk=quote.spoilage_risk,
        transit_advisory=quote.transit_advisory,
        status="Driver Assigned",
        driver_name=driver["name"],
        driver_phone=driver["phone"],
        vehicle_number=driver["vehicle"],
        current_location="Assigned Driver en route to farm pickup",
        delivery_partner=DEFAULT_DELIVERY_PARTNER,
        partner_rating=DEFAULT_PARTNER_RATING,
        estimated_delivery_time=quote.estimated_delivery_time,
        payment_status="Pending Payment",
        created_at=now
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def generate_gate_pass(db: Session, order_id: int) -> ConsignmentGatePass:
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise ValueError("Delivery order not found")
    
    farmer = db.query(User).filter(User.id == order.user_id).first()
    farmer_name = farmer.name if farmer else "Verified AgroGuide Farmer"
    farmer_phone = farmer.phone if farmer else "+91 98765 43210"

    now_ist = datetime.now(IST)
    gate_pass_num = f"MANDI-GP-{order.id:04d}-{now_ist.strftime('%d%m%y')}"
    qr_data = f"GATEPASS:{gate_pass_num}|TRK:{order.tracking_number}|FARMER:{farmer_name}|CROP:{order.crop_name}|QTY:{order.quantity_quintals}QTL|MANDI:{order.destination_mandi}|VEH:{order.vehicle_number}"

    return ConsignmentGatePass(
        gate_pass_id=gate_pass_num,
        tracking_number=order.tracking_number,
        farmer_name=farmer_name,
        farmer_phone=farmer_phone,
        crop_name=order.crop_name,
        quantity_quintals=order.quantity_quintals,
        packaging_type=order.packaging_type,
        destination_mandi=order.destination_mandi,
        vehicle_number=order.vehicle_number,
        driver_name=order.driver_name,
        driver_phone=order.driver_phone,
        dispatch_timestamp=now_ist.strftime("%d %b %Y, %I:%M %p"),
        status=order.status,
        qr_code_payload=qr_data
    )


def process_order_payment(
    db: Session, order_id: int, payment_in: DeliveryPaymentRequest
) -> DeliveryOrder:
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise ValueError("Delivery order not found")

    if order.payment_status == "Paid":
        raise ValueError("This order has already been paid")

    order.payment_method = payment_in.payment_method

    if payment_in.payment_method == "Cash":
        order.payment_status = "Pay on Delivery"
        order.status = "Driver Assigned"
    else:
        order.payment_id = f"PAY-AGD-{random.randint(100000, 999999)}"
        order.payment_status = "Paid"
        order.status = "Paid & Scheduled for Pickup"

    db.commit()
    db.refresh(order)
    return order
