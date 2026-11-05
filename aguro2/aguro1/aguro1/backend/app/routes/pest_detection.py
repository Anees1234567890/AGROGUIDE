from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.models.pest_detection import PestScanRecord
from app.models.user import User
from app.schemas.pest_detection import PestScanRequest, PestScanResponse, SampleScanItem
from app.services.pest_detection_service import analyze_plant_scan, get_sample_scans
from app.auth.dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/pest-detection", tags=["AI Pest & Disease Scanner"])


from app.services.disease_service import predict_crop_disease


@router.post("/scan", response_model=PestScanResponse)
def scan_plant_disease(
    request: PestScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    # Check 3-step guardrail if image_data is provided without sample_id
    if request.image_data and not request.sample_id:
        val_res = predict_crop_disease(request.image_data, crop_hint=request.crop_name)
        if val_res.get("status") == "REJECTED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=val_res.get("user_message", "Invalid image detected. Please upload a clear photo of a crop leaf.")
            )

    user_id = current_user.id if current_user else None
    return analyze_plant_scan(request, db=db, user_id=user_id)


@router.post("/validate-and-predict")
@router.post("/predict")
def predict_disease_with_guardrails(request: PestScanRequest):
    """
    AgroGuide 3-Step Pre-Classification Guardrails API Endpoint.
    Returns structured REJECTED or SUCCESS JSON response according to AgroGuide Disease Scanner specifications.
    """
    if not request.image_data and not request.sample_id:
        return {
            "status": "REJECTED",
            "error_code": "MISSING_IMAGE",
            "is_valid_crop_leaf": False,
            "confidence_score": 0.0,
            "user_message": "Please upload a clear photo of a crop leaf."
        }

    image_input = request.image_data or request.sample_id or ""
    return predict_crop_disease(image_input, crop_hint=request.crop_name)



@router.get("/samples", response_model=List[SampleScanItem])
def list_sample_scans():
    return get_sample_scans()


@router.get("/history", response_model=List[PestScanResponse])
def get_scan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(PestScanRecord).filter(
        PestScanRecord.user_id == current_user.id
    ).order_by(PestScanRecord.scanned_at.desc()).limit(20).all()

    results: List[PestScanResponse] = []
    for r in records:
        from app.schemas.pest_detection import TreatmentPlan
        t_plan = TreatmentPlan(
            organic_control=r.organic_treatment,
            chemical_control=r.chemical_treatment,
            cultural_prevention=r.cultural_control,
            spray_schedule="Follow 7-14 day interval"
        )
        results.append(PestScanResponse(
            id=r.id,
            crop_name=r.crop_name,
            plant_part=r.plant_part,
            detected_disease=r.detected_disease,
            scientific_name=r.scientific_name,
            pathogen_type=r.pathogen_type,
            confidence_score=r.confidence_score,
            severity=r.severity,
            severity_score=8 if r.severity in ["Severe", "High"] else 5,
            image_url=r.image_url,
            symptoms_matched=r.symptoms.split("; ") if r.symptoms else [],
            treatment_plan=t_plan,
            immediate_action=r.action_plan or "Apply recommended bio-spray immediately.",
            scanned_at=r.scanned_at
        ))
    return results
