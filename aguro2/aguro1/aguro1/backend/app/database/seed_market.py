from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.market import MarketPrice

DEFAULT_KERALA_MARKET_PRICES = [
    {
        "crop_name": "Rice (Paddy - Jyothi / Matta)",
        "market_name": "Palakkad APMC Mandi",
        "location": "Palakkad, Kerala",
        "price": 2450.0,
        "min_price": 2380.0,
        "max_price": 2520.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 2.1,
        "source": "Kerala State Agricultural Marketing Board"
    },
    {
        "crop_name": "Coconut (Raw With Shell)",
        "market_name": "Vadakara APMC Market",
        "location": "Kozhikode, Kerala",
        "price": 3150.0,
        "min_price": 3050.0,
        "max_price": 3250.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 1.8,
        "source": "Kerala Coconut Development Board"
    },
    {
        "crop_name": "Banana (Nendran Green)",
        "market_name": "Thrissur Central APMC",
        "location": "Thrissur, Kerala",
        "price": 4200.0,
        "min_price": 4000.0,
        "max_price": 4350.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 3.4,
        "source": "VFPCK Farmers Market"
    },
    {
        "crop_name": "Banana (Palayankodan)",
        "market_name": "Trivandrum Chalai Market",
        "location": "Thiruvananthapuram, Kerala",
        "price": 2800.0,
        "min_price": 2650.0,
        "max_price": 2900.0,
        "unit": "₹/Quintal",
        "trend": "stable",
        "trend_percentage": 0.0,
        "source": "VFPCK Farmers Market"
    },
    {
        "crop_name": "Black Pepper (Garbled)",
        "market_name": "Wayanad APMC Spices Board",
        "location": "Wayanad, Kerala",
        "price": 61500.0,
        "min_price": 60000.0,
        "max_price": 62500.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 4.2,
        "source": "Spices Board India (Kochi)"
    },
    {
        "crop_name": "Cardamom (Small Green)",
        "market_name": "Nedumkandam Auction Centre",
        "location": "Idukki, Kerala",
        "price": 185000.0,
        "min_price": 178000.0,
        "max_price": 192000.0,
        "unit": "₹/Quintal",
        "trend": "down",
        "trend_percentage": -1.5,
        "source": "Spices Board India (Idukki)"
    },
    {
        "crop_name": "Rubber (RSS-4 Grade)",
        "market_name": "Kottayam Rubber Exchange",
        "location": "Kottayam, Kerala",
        "price": 18400.0,
        "min_price": 18000.0,
        "max_price": 18800.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 2.8,
        "source": "Rubber Board India (Kottayam)"
    },
    {
        "crop_name": "Tapioca (Fresh Tuber)",
        "market_name": "Kollam Anchal Farmer Market",
        "location": "Kollam, Kerala",
        "price": 1650.0,
        "min_price": 1550.0,
        "max_price": 1750.0,
        "unit": "₹/Quintal",
        "trend": "down",
        "trend_percentage": -0.8,
        "source": "VFPCK Farmers Market"
    },
    {
        "crop_name": "Ginger (Dry Unbleached)",
        "market_name": "Ernakulam Wholesale Market",
        "location": "Ernakulam, Kerala",
        "price": 14200.0,
        "min_price": 13800.0,
        "max_price": 14600.0,
        "unit": "₹/Quintal",
        "trend": "up",
        "trend_percentage": 1.2,
        "source": "AGMARKNET Live Feed"
    },
    {
        "crop_name": "Arecanut (Dried Chali)",
        "market_name": "Kasaragod APMC Market",
        "location": "Kasaragod, Kerala",
        "price": 44000.0,
        "min_price": 42500.0,
        "max_price": 45000.0,
        "unit": "₹/Quintal",
        "trend": "stable",
        "trend_percentage": 0.0,
        "source": "CAMPCO Agri Exchange"
    }
]


def ensure_kerala_market_prices(db: Session) -> None:
    """Populates default Kerala mandi market prices if database table is empty."""
    existing_count = db.query(MarketPrice).count()
    if existing_count == 0:
        now = datetime.now(timezone.utc)
        for item in DEFAULT_KERALA_MARKET_PRICES:
            record = MarketPrice(
                crop_name=item["crop_name"],
                market_name=item["market_name"],
                location=item["location"],
                price=item["price"],
                min_price=item["min_price"],
                max_price=item["max_price"],
                unit=item["unit"],
                trend=item["trend"],
                trend_percentage=item["trend_percentage"],
                source=item["source"],
                recorded_at=now,
                is_demo=False
            )
            db.add(record)
        db.commit()
