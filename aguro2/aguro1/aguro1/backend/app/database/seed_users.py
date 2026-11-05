from sqlalchemy.orm import Session
from app.models.user import User, Farm
from app.auth.security import get_password_hash


def ensure_default_demo_users(db: Session) -> None:
    """Ensures default demo users (Admin, Farmer, Expert) exist in the database with correct credentials."""
    # 1. Admin User
    admin = db.query(User).filter(User.email == "admin@agroguide.com").first()
    if not admin:
        admin = User(
            name="System Admin",
            email="admin@agroguide.com",
            phone="+91 99999 00000",
            password_hash=get_password_hash("admin123"),
            role="Admin",
            preferred_language="en",
            state="Kerala",
            district="Thiruvananthapuram",
            is_active=True,
        )
        db.add(admin)
        db.commit()

    # 2. Farmer User
    farmer = db.query(User).filter(User.email == "farmer@agroguide.com").first()
    if not farmer:
        farmer = User(
            name="Sreeraj Menon",
            email="farmer@agroguide.com",
            phone="+91 98765 43210",
            password_hash=get_password_hash("farmer123"),
            role="Farmer",
            preferred_language="en",
            state="Kerala",
            district="Palakkad",
            is_active=True,
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        farm = Farm(
            user_id=farmer.id,
            farm_name="Menon Greenfield Farms",
            farm_size=3.5,
            soil_type="Alluvial",
            soil_ph=6.5,
            irrigation_type="Canal / River",
            location="Palakkad, Kerala",
            current_season="Kharif",
            current_crops="Rice (Paddy), Banana (Nendran)",
        )
        db.add(farm)
        db.commit()

    # Ensure demo farmer has previous farm history logs
    if farmer:
        from app.models.user import FarmHistory
        existing_hist = db.query(FarmHistory).filter(FarmHistory.user_id == farmer.id).first()
        if not existing_hist:
            history_items = [
                FarmHistory(
                    user_id=farmer.id,
                    season="Kharif 2025",
                    crop_name="Rice (Paddy - Jyothi)",
                    area_cultivated=2.5,
                    yield_harvested="4,200 kg",
                    sowing_date="June 2025",
                    harvest_date="October 2025",
                    fertilizers_used="FYM 5 tonnes + NPK 90:45:45 kg/ha split dose",
                    pest_issues="Minor leaf folder; controlled using Pseudomonas fluorescens @ 20g/L",
                    revenue_earned=96600.0,
                    notes="Excellent monsoon rainfall; recorded peak grain weight."
                ),
                FarmHistory(
                    user_id=farmer.id,
                    season="Rabi 2024-25",
                    crop_name="Banana (Nendran)",
                    area_cultivated=1.5,
                    yield_harvested="9,800 kg (650 bunches)",
                    sowing_date="August 2024",
                    harvest_date="July 2025",
                    fertilizers_used="Organic FYM 10 kg/plant + Neem Cake + Potash split dose",
                    pest_issues="Sigatoka leaf spot; managed with Mineral Oil + Carbendazim spray",
                    revenue_earned=392000.0,
                    notes="High Onam festival market demand; sold at ₹40/kg."
                ),
                FarmHistory(
                    user_id=farmer.id,
                    season="Puncha 2024",
                    crop_name="Black Pepper & Ginger",
                    area_cultivated=1.0,
                    yield_harvested="850 kg dry pepper & 1,400 kg ginger",
                    sowing_date="May 2024",
                    harvest_date="February 2025",
                    fertilizers_used="Vermicompost + Jeevamrutha bio-fertilizer biweekly",
                    pest_issues="Quick wilt preventive soil drenching with Trichoderma viride",
                    revenue_earned=595000.0,
                    notes="Premium garbled pepper quality fetched highest APMC mandi rate."
                )
            ]
            db.add_all(history_items)
            db.commit()

    # 3. Agricultural Professional / Expert User
    expert = db.query(User).filter(User.email == "expert@agroguide.com").first()
    if not expert:
        expert = User(
            name="Dr. Radhakrishnan Nair",
            email="expert@agroguide.com",
            phone="+91 94471 23456",
            password_hash=get_password_hash("expert123"),
            role="Agricultural Professional",
            preferred_language="en",
            state="Kerala",
            district="Thrissur",
            is_active=True,
        )
        db.add(expert)
        db.commit()
