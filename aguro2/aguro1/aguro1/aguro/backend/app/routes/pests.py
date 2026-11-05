from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.models.crop import CropPest, CropDisease
from app.schemas.crop import (
    PestResponse,
    PestCreate,
    DiseaseResponse,
    DiseaseCreate,
)
from app.auth.dependencies import get_current_admin

router = APIRouter(tags=["Pest & Disease Guide"])


@router.get("/pests", response_model=List[PestResponse])
def get_pests(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search by pest name, symptoms or prevention"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name")
):
    q = db.query(CropPest)
    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(
            (CropPest.name.ilike(pattern)) |
            (CropPest.symptoms.ilike(pattern)) |
            (CropPest.prevention.ilike(pattern)) |
            (CropPest.management.ilike(pattern)) |
            (CropPest.crop_name.ilike(pattern))
        )
    if crop_name:
        q = q.filter(CropPest.crop_name.ilike(f"%{crop_name.strip()}%"))

    return q.order_by(CropPest.name.asc()).all()


@router.get("/diseases", response_model=List[DiseaseResponse])
def get_diseases(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search by disease name, symptoms or prevention"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name")
):
    q = db.query(CropDisease)
    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(
            (CropDisease.name.ilike(pattern)) |
            (CropDisease.symptoms.ilike(pattern)) |
            (CropDisease.prevention.ilike(pattern)) |
            (CropDisease.management.ilike(pattern)) |
            (CropDisease.crop_name.ilike(pattern))
        )
    if crop_name:
        q = q.filter(CropDisease.crop_name.ilike(f"%{crop_name.strip()}%"))

    return q.order_by(CropDisease.name.asc()).all()


@router.post("/pests", response_model=PestResponse, status_code=status.HTTP_201_CREATED)
def create_pest(
    pest_in: PestCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    pest = CropPest(**pest_in.model_dump())
    db.add(pest)
    db.commit()
    db.refresh(pest)
    return PestResponse.model_validate(pest)


@router.post("/diseases", response_model=DiseaseResponse, status_code=status.HTTP_201_CREATED)
def create_disease(
    disease_in: DiseaseCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    disease = CropDisease(**disease_in.model_dump())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return DiseaseResponse.model_validate(disease)


@router.delete("/pests/{pest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pest(
    pest_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    pest = db.query(CropPest).filter(CropPest.id == pest_id).first()
    if not pest:
        raise HTTPException(status_code=404, detail="Pest record not found")
    db.delete(pest)
    db.commit()
    return None


@router.delete("/diseases/{disease_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disease(
    disease_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    disease = db.query(CropDisease).filter(CropDisease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease record not found")
    db.delete(disease)
    db.commit()
    return None
