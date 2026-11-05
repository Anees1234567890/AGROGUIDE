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
