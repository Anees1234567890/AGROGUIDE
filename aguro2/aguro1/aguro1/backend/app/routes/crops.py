from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
import math
from app.database.session import get_db
from app.models.crop import Crop
from app.schemas.crop import (
    CropCreate,
    CropUpdate,
    CropResponse,
    CropListResponse,
)
from app.auth.dependencies import get_current_admin

router = APIRouter(prefix="/crops", tags=["Crops"])


@router.get("", response_model=CropListResponse)
def get_crops(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search term for crop name or scientific name"),
    category: Optional[str] = Query(None, description="Filter by crop category"),
    season: Optional[str] = Query(None, description="Filter by suitable season (Kharif, Rabi, Zaid, Whole Year)"),
    soil: Optional[str] = Query(None, description="Filter by suitable soil type"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    q = db.query(Crop)

    if query:
        search_pattern = f"%{query.strip()}%"
        q = q.filter(
            (Crop.name.ilike(search_pattern)) |
            (Crop.local_name.ilike(search_pattern)) |
            (Crop.scientific_name.ilike(search_pattern)) |
            (Crop.cultivation_info.ilike(search_pattern))
        )

    if category and category.lower() != "all":
        q = q.filter(Crop.category.ilike(f"%{category.strip()}%"))

    if season and season.lower() != "all":
        q = q.filter(
            (Crop.suitable_season.ilike(f"%{season.strip()}%")) |
            (Crop.suitable_season.ilike("%whole year%")) |
            (Crop.suitable_season.ilike("%all season%"))
        )

    if soil and soil.lower() != "all":
        q = q.filter(
            (Crop.suitable_soil.ilike(f"%{soil.strip()}%")) |
            (Crop.suitable_soil.ilike("%all%")) |
            (Crop.suitable_soil.ilike("%loam%"))
        )

    total = q.count()
    total_pages = max(1, math.ceil(total / limit))
    crops = q.order_by(Crop.name.asc()).offset((page - 1) * limit).limit(limit).all()

    return CropListResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        crops=[CropResponse.model_validate(c) for c in crops]
    )


@router.get("/categories", response_model=List[str])
def get_crop_categories(db: Session = Depends(get_db)):
    categories = db.query(Crop.category).distinct().all()
    return sorted([c[0] for c in categories if c[0]])


@router.get("/{crop_id}", response_model=CropResponse)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} not found."
        )
    return CropResponse.model_validate(crop)


@router.post("", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def create_crop(
    crop_in: CropCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    crop = Crop(**crop_in.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return CropResponse.model_validate(crop)


@router.put("/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: int,
    crop_in: CropUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} not found."
        )

    for field, val in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, field, val)

    db.commit()
    db.refresh(crop)
    return CropResponse.model_validate(crop)


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop with ID {crop_id} not found."
        )

    db.delete(crop)
    db.commit()
    return None
