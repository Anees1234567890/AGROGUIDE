from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.database.session import get_db
from app.models.professional import Professional, SupportRequest
from app.models.user import User
from app.schemas.professional import (
    ProfessionalResponse,
    ProfessionalCreate,
    SupportRequestCreate,
    SupportRequestResponse,
)
from app.auth.dependencies import get_current_user, get_current_admin

router = APIRouter(tags=["Agricultural Professionals & Expert Support"])


@router.get("/professionals", response_model=List[ProfessionalResponse])
def get_professionals(
    db: Session = Depends(get_db),
    expertise: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    query: Optional[str] = Query(None)
):
    q = db.query(Professional).filter(Professional.is_verified == True)

    if expertise and expertise.lower() != "all":
        q = q.filter(Professional.expertise.ilike(f"%{expertise.strip()}%"))

    if location and location.lower() != "all":
        q = q.filter(Professional.location.ilike(f"%{location.strip()}%"))

    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(
            (Professional.name.ilike(pattern)) |
            (Professional.expertise.ilike(pattern)) |
            (Professional.institution.ilike(pattern)) |
            (Professional.bio.ilike(pattern))
        )

    return q.order_by(Professional.name.asc()).all()


@router.post("/support-requests", response_model=SupportRequestResponse, status_code=status.HTTP_201_CREATED)
def create_support_request(
    req_in: SupportRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prof = db.query(Professional).filter(Professional.id == req_in.professional_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Selected agricultural professional was not found")

    support_req = SupportRequest(
        farmer_id=current_user.id,
        professional_id=prof.id,
        subject=req_in.subject,
        crop_name=req_in.crop_name,
        message=req_in.message.strip(),
        status="Pending"
    )
    db.add(support_req)
    db.commit()
    db.refresh(support_req)

    return SupportRequestResponse(
        id=support_req.id,
        farmer_id=support_req.farmer_id,
        professional_id=support_req.professional_id,
        subject=support_req.subject,
        crop_name=support_req.crop_name,
        message=support_req.message,
        status=support_req.status,
        response=support_req.response,
        responded_at=support_req.responded_at,
        created_at=support_req.created_at,
        professional=ProfessionalResponse.model_validate(prof)
    )


@router.get("/support-requests/my", response_model=List[SupportRequestResponse])
def get_my_support_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Agricultural Professional":
        prof = db.query(Professional).filter(Professional.user_id == current_user.id).first()
        if prof:
            requests = db.query(SupportRequest).filter(SupportRequest.professional_id == prof.id).order_by(SupportRequest.created_at.desc()).all()
        else:
            requests = db.query(SupportRequest).order_by(SupportRequest.created_at.desc()).all()
    else:
        requests = db.query(SupportRequest).filter(SupportRequest.farmer_id == current_user.id).order_by(SupportRequest.created_at.desc()).all()

    result: List[SupportRequestResponse] = []
    for r in requests:
        prof_res = ProfessionalResponse.model_validate(r.professional) if r.professional else None
        result.append(SupportRequestResponse(
            id=r.id,
            farmer_id=r.farmer_id,
            professional_id=r.professional_id,
            subject=r.subject,
            crop_name=r.crop_name,
            message=r.message,
            status=r.status,
            response=r.response,
            responded_at=r.responded_at,
            created_at=r.created_at,
            professional=prof_res
        ))
    return result
