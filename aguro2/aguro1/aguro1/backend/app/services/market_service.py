from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.market import MarketPrice
from app.schemas.market import MarketPriceResponse, MarketPriceListResponse

# Demo market seed records for major crops and APMC mandis in India / Kerala
DEFAULT_MARKET_RECORDS = [
    {"crop_name": "Paddy (Common/Jyothi)", "market_name": "Palakkad APMC", "location": "Palakkad, Kerala", "price": 2820.0, "min_price": 2750.0, "max_price": 2900.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 2.4},
    {"crop_name": "Coconut (Raw)", "market_name": "Kozhikode Mandi", "location": "Kozhikode, Kerala", "price": 38.5, "min_price": 35.0, "max_price": 42.0, "unit": "₹/Piece", "trend": "up", "trend_percentage": 4.1},
    {"crop_name": "Copra (Milling)", "market_name": "Alappuzha Market", "location": "Alappuzha, Kerala", "price": 9850.0, "min_price": 9600.0, "max_price": 10100.0, "unit": "₹/Quintal", "trend": "stable", "trend_percentage": 0.2},
    {"crop_name": "Black Pepper (Garbled)", "market_name": "Kochi Terminal Market", "location": "Ernakulam, Kerala", "price": 59500.0, "min_price": 58000.0, "max_price": 61200.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 1.8},
    {"crop_name": "Small Cardamom", "market_name": "Spices Board E-Auction, Vandanmedu", "location": "Idukki, Kerala", "price": 2150.0, "min_price": 1950.0, "max_price": 2380.0, "unit": "₹/Kg", "trend": "up", "trend_percentage": 3.6},
    {"crop_name": "Natural Rubber (RSS-4)", "market_name": "Kottayam Rubber Board", "location": "Kottayam, Kerala", "price": 18200.0, "min_price": 17800.0, "max_price": 18500.0, "unit": "₹/Quintal", "trend": "down", "trend_percentage": -1.2},
    {"crop_name": "Banana (Nendran)", "market_name": "Thrissur Agricultural Market", "location": "Thrissur, Kerala", "price": 4200.0, "min_price": 3800.0, "max_price": 4600.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 5.0},
    {"crop_name": "Banana (Robusta)", "market_name": "Wayanad Agri Produce Market", "location": "Wayanad, Kerala", "price": 2400.0, "min_price": 2200.0, "max_price": 2600.0, "unit": "₹/Quintal", "trend": "stable", "trend_percentage": 0.0},
    {"crop_name": "Arecanut (Rashi)", "market_name": "Kasaragod Mandi", "location": "Kasaragod, Kerala", "price": 48500.0, "min_price": 46000.0, "max_price": 50000.0, "unit": "₹/Quintal", "trend": "down", "trend_percentage": -0.8},
    {"crop_name": "Ginger (Fresh)", "market_name": "Mananthavady Market", "location": "Wayanad, Kerala", "price": 8500.0, "min_price": 7800.0, "max_price": 9200.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 6.2},
    {"crop_name": "Turmeric (Finger)", "market_name": "Coimbatore APMC", "location": "Tamil Nadu Border / Palakkad", "price": 14200.0, "min_price": 13500.0, "max_price": 15000.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 2.9},
    {"crop_name": "Tapioca (Fresh Tuber)", "market_name": "Kollam Regulated Market", "location": "Kollam, Kerala", "price": 1850.0, "min_price": 1600.0, "max_price": 2100.0, "unit": "₹/Quintal", "trend": "stable", "trend_percentage": 0.5},
    {"crop_name": "Tomato (Hybrid)", "market_name": "Ottapalam Mandi", "location": "Palakkad, Kerala", "price": 2600.0, "min_price": 2200.0, "max_price": 3000.0, "unit": "₹/Quintal", "trend": "down", "trend_percentage": -4.2},
    {"crop_name": "Green Chilli", "market_name": "Chalakkudy APMC", "location": "Thrissur, Kerala", "price": 4800.0, "min_price": 4400.0, "max_price": 5300.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 3.1},
    {"crop_name": "Onion (Big)", "market_name": "Ernakulam Wholesale Market", "location": "Ernakulam, Kerala", "price": 3200.0, "min_price": 2900.0, "max_price": 3500.0, "unit": "₹/Quintal", "trend": "down", "trend_percentage": -2.0},
    {"crop_name": "Elephant Foot Yam (Chenai)", "market_name": "Pathanamthitta Market", "location": "Pathanamthitta, Kerala", "price": 3400.0, "min_price": 3100.0, "max_price": 3700.0, "unit": "₹/Quintal", "trend": "stable", "trend_percentage": 0.8},
    {"crop_name": "Nutmeg (With Shell)", "market_name": "Kalady Spice Market", "location": "Ernakulam, Kerala", "price": 32000.0, "min_price": 30000.0, "max_price": 34500.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 1.5},
    {"crop_name": "Cashew Nut (Raw)", "market_name": "Kannur APMC", "location": "Kannur, Kerala", "price": 12500.0, "min_price": 11800.0, "max_price": 13200.0, "unit": "₹/Quintal", "trend": "up", "trend_percentage": 2.0},
    {"crop_name": "Tea (CTC Broken Pekoe)", "market_name": "Kochi Tea Auction Center", "location": "Ernakulam, Kerala", "price": 165.0, "min_price": 140.0, "max_price": 195.0, "unit": "₹/Kg", "trend": "down", "trend_percentage": -1.5},
    {"crop_name": "Coffee (Robusta Cherry)", "market_name": "Kalpetta Market", "location": "Wayanad, Kerala", "price": 8200.0, "min_price": 7900.0, "max_price": 8500.0, "unit": "₹/50 Kg Bag", "trend": "up", "trend_percentage": 4.5},
]


def get_market_prices(
    db: Session,
    query: Optional[str] = None,
    location: Optional[str] = None,
    crop_name: Optional[str] = None,
    sort_by: str = "recorded_at",
    order: str = "desc",
    page: int = 1,
    limit: int = 20
) -> MarketPriceListResponse:
    q = db.query(MarketPrice)

    if query:
        search_pattern = f"%{query.strip()}%"
        q = q.filter(
            (MarketPrice.crop_name.ilike(search_pattern)) |
            (MarketPrice.market_name.ilike(search_pattern)) |
            (MarketPrice.location.ilike(search_pattern))
        )

    if crop_name:
        q = q.filter(MarketPrice.crop_name.ilike(f"%{crop_name.strip()}%"))

    if location:
        q = q.filter(MarketPrice.location.ilike(f"%{location.strip()}%"))

    total = q.count()

    # Sorting
    if sort_by == "price":
        q = q.order_by(MarketPrice.price.desc() if order == "desc" else MarketPrice.price.asc())
    elif sort_by == "crop_name":
        q = q.order_by(MarketPrice.crop_name.asc() if order == "asc" else MarketPrice.crop_name.desc())
    else:
        q = q.order_by(MarketPrice.recorded_at.desc() if order == "desc" else MarketPrice.recorded_at.asc())

    items = q.offset((page - 1) * limit).limit(limit).all()

    return MarketPriceListResponse(
        total=total,
        page=page,
        limit=limit,
        is_demo_mode=True,
        notice="Demo market data — connect a supported APMC / AGMARKNET API for live mandi price integration.",
        items=[MarketPriceResponse.model_validate(item) for item in items]
    )
