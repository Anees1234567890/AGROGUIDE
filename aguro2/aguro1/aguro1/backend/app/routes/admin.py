from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database.session import get_db
from app.models.user import User
from app.models.crop import Crop
from app.models.community import CommunityPost
from app.models.professional import Professional, SupportRequest
from app.models.market import MarketPrice
from app.schemas.user import UserResponse
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
) -> Dict[str, Any]:
    total_users = db.query(User).count()
    total_farmers = db.query(User).filter(User.role == "Farmer").count()
    total_professionals = db.query(Professional).count()
    total_crops = db.query(Crop).count()
    total_posts = db.query(CommunityPost).count()
    total_support_requests = db.query(SupportRequest).count()
    total_market_prices = db.query(MarketPrice).count()

    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_professionals": total_professionals,
        "total_crops": total_crops,
        "total_posts": total_posts,
        "total_support_requests": total_support_requests,
        "total_market_prices": total_market_prices
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    role: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    admin=Depends(get_current_admin)
):
    q = db.query(User)
    if role and role.lower() != "all":
        q = q.filter(User.role == role)
    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(
            (User.name.ilike(pattern)) |
            (User.email.ilike(pattern)) |
            (User.district.ilike(pattern))
        )
    users = q.order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/status")
def toggle_user_active_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"status": "success", "user_id": user_id, "is_active": user.is_active}


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    if role not in ["Farmer", "Agricultural Professional", "Admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"status": "success", "user_id": user_id, "role": user.role}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return None


from app.schemas.market import MarketPriceCreate, MarketPriceUpdate, MarketPriceResponse


@router.post("/market-prices", response_model=MarketPriceResponse, status_code=status.HTTP_201_CREATED)
def create_market_price(
    price_in: MarketPriceCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    from datetime import datetime, timezone
    new_price = MarketPrice(
        crop_name=price_in.crop_name.strip(),
        market_name=price_in.market_name.strip(),
        location=price_in.location.strip(),
        price=float(price_in.price),
        min_price=float(price_in.min_price) if price_in.min_price is not None else float(price_in.price) * 0.95,
        max_price=float(price_in.max_price) if price_in.max_price is not None else float(price_in.price) * 1.05,
        unit=price_in.unit or "₹/Quintal",
        trend=price_in.trend or "up",
        trend_percentage=float(price_in.trend_percentage) if price_in.trend_percentage is not None else 1.5,
        source=price_in.source or "Admin Update / State Agri Board",
        recorded_at=datetime.now(timezone.utc),
        is_demo=False
    )
    db.add(new_price)
    db.commit()
    db.refresh(new_price)
    return MarketPriceResponse.model_validate(new_price)


@router.put("/market-prices/{price_id}", response_model=MarketPriceResponse)
def update_market_price(
    price_id: int,
    price_in: MarketPriceUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    from datetime import datetime, timezone
    record = db.query(MarketPrice).filter(MarketPrice.id == price_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Market price record not found")

    if price_in.crop_name is not None:
        record.crop_name = price_in.crop_name.strip()
    if price_in.market_name is not None:
        record.market_name = price_in.market_name.strip()
    if price_in.location is not None:
        record.location = price_in.location.strip()
    if price_in.price is not None:
        record.price = float(price_in.price)
    if price_in.min_price is not None:
        record.min_price = float(price_in.min_price)
    if price_in.max_price is not None:
        record.max_price = float(price_in.max_price)
    if price_in.unit is not None:
        record.unit = price_in.unit
    if price_in.trend is not None:
        record.trend = price_in.trend
    if price_in.trend_percentage is not None:
        record.trend_percentage = float(price_in.trend_percentage)

    record.source = "Admin Update / Live Market Board"
    record.recorded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(record)
    return MarketPriceResponse.model_validate(record)


@router.delete("/market-prices/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_market_price(
    price_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    record = db.query(MarketPrice).filter(MarketPrice.id == price_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Market price record not found")
    db.delete(record)
    db.commit()
    return None


