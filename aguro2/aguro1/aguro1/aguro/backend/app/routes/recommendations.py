from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.models.crop import Recommendation, Crop
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationHistoryResponse,
)
from app.services.recommendation_service import generate_crop_recommendations
from app.auth.dependencies import get_optional_user, get_current_user
from app.models.user import User

router = APIRouter(prefix="/recommendations", tags=["Crop Recommendation"])


@router.post("", response_model=RecommendationResponse)
def get_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
    limit: int = Query(12, ge=1, le=50)
):
    result = generate_crop_recommendations(db, request, limit=limit)

    # If user is logged in, log top 3 recommendations to history
    if current_user and result.recommendations:
        for rec in result.recommendations[:3]:
            history_entry = Recommendation(
                user_id=current_user.id,
                crop_id=rec.crop.id,
                score=rec.score,
                suitability_level=rec.suitability_level,
                reason=rec.why_recommended,
                soil_suitability=rec.soil_suitability,
                season_suitability=rec.season_suitability,
                water_suitability=rec.water_suitability,
                state=request.state,
                district=request.district
            )
            db.add(history_entry)
        try:
            db.commit()
        except Exception:
            db.rollback()

    return result


@router.get("/history", response_model=List[RecommendationHistoryResponse])
def get_user_recommendation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    history = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).limit(limit).all()

    items: List[RecommendationHistoryResponse] = []
    for h in history:
        crop_name = h.crop.name if h.crop else "Unknown Crop"
        items.append(RecommendationHistoryResponse(
            id=h.id,
            crop_id=h.crop_id,
            crop_name=crop_name,
            score=h.score,
            suitability_level=h.suitability_level,
            reason=h.reason,
            state=h.state,
            district=h.district,
            created_at=h.created_at
        ))
    return items
