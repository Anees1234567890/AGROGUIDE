import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone
from app.database.session import get_db
from app.models.professional import Professional, SupportRequest
from app.models.user import User
from app.schemas.professional import (
    ProfessionalResponse,
    ProfessionalCreate,
    SupportRequestCreate,
    SupportRequestResponse,
    SupportRequestResponseUpdate,
)

from app.auth.dependencies import get_current_user, get_current_admin

from app.config import settings, BASE_DIR

router = APIRouter(tags=["Agricultural Professionals & Expert Support"])

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def format_support_request_response(r: SupportRequest) -> SupportRequestResponse:
    prof_res = ProfessionalResponse.model_validate(r.professional) if r.professional else None
    farmer_name = r.farmer.name if r.farmer else "Farmer"
    farmer_district = r.farmer.district if r.farmer else "Kerala"
    consult_code = r.consultation_code or f"AGC-{1000 + r.id}"

    return SupportRequestResponse(
        id=r.id,
        consultation_code=consult_code,
        farmer_id=r.farmer_id,
        farmer_name=farmer_name,
        farmer_district=farmer_district,
        professional_id=r.professional_id,
        subject=r.subject,
        crop_name=r.crop_name,
        message=r.message,
        image_url=r.image_url,
        suspected_disease=r.suspected_disease,
        treatment=r.treatment,
        preventive_measures=r.preventive_measures,
        status=r.status,
        response=r.response,
        responded_at=r.responded_at,
        created_at=r.created_at,
        professional=prof_res,
    )


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


@router.post("/support-requests/upload-image")
async def upload_disease_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only JPG, JPEG, PNG, and WEBP image files are allowed."
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum allowed limit of 5 MB."
        )

    unique_filename = f"disease_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{unique_filename}"
    return {"status": "success", "image_url": image_url}


@router.post("/support-requests", response_model=SupportRequestResponse, status_code=status.HTTP_201_CREATED)
def create_support_request(
    req_in: SupportRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prof_id = req_in.professional_id
    if not prof_id:
        first_prof = db.query(Professional).filter(Professional.is_verified == True).first()
        if first_prof:
            prof_id = first_prof.id
        else:
            raise HTTPException(status_code=404, detail="No agricultural professional is currently available.")

    prof = db.query(Professional).filter(Professional.id == prof_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Selected agricultural professional was not found")

    support_req = SupportRequest(
        farmer_id=current_user.id,
        professional_id=prof.id,
        subject=req_in.subject or "Crop Disease Consultation",
        crop_name=req_in.crop_name or "Unspecified Crop",
        message=req_in.message.strip(),
        image_url=req_in.image_url,
        status="Pending"
    )
    db.add(support_req)
    db.commit()
    db.refresh(support_req)

    support_req.consultation_code = f"AGC-{1000 + support_req.id}"
    db.commit()

    return format_support_request_response(support_req)


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
        # Strictly return ONLY the logged-in farmer's consultations!
        requests = db.query(SupportRequest).filter(SupportRequest.farmer_id == current_user.id).order_by(SupportRequest.created_at.desc()).all()

    return [format_support_request_response(r) for r in requests]


@router.put("/support-requests/{request_id}/respond", response_model=SupportRequestResponse)
def respond_to_support_request(
    request_id: int,
    res_in: SupportRequestResponseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Support request not found")

    req.response = res_in.response.strip()
    req.status = res_in.status or "Responded"
    if res_in.suspected_disease:
        req.suspected_disease = res_in.suspected_disease.strip()
    if res_in.treatment:
        req.treatment = res_in.treatment.strip()
    if res_in.preventive_measures:
        req.preventive_measures = res_in.preventive_measures.strip()

    req.responded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(req)

    return format_support_request_response(req)


@router.put("/support-requests/{request_id}/status", response_model=SupportRequestResponse)
def update_support_request_status(
    request_id: int,
    status_str: str = Query("In Review"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Support request not found")

    req.status = status_str
    db.commit()
    db.refresh(req)

    return format_support_request_response(req)


