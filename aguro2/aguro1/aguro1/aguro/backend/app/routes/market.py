from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.database.session import get_db
from app.schemas.market import MarketPriceListResponse
from app.services.market_service import get_market_prices
from app.services.agmarknet_service import fetch_agmarknet_live_data, sync_agmarknet_to_database

router = APIRouter(prefix="/market-prices", tags=["Market Prices"])


@router.get("", response_model=MarketPriceListResponse)
def list_market_prices(
    db: Session = Depends(get_db),
    query: Optional[str] = Query(None, description="Search crop or mandi name"),
    location: Optional[str] = Query(None, description="Filter by location/district"),
    crop_name: Optional[str] = Query(None, description="Filter by exact or partial crop name"),
    sort_by: str = Query("recorded_at", description="Sort by recorded_at, price, crop_name"),
    order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    return get_market_prices(
        db=db,
        query=query,
        location=location,
        crop_name=crop_name,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit
    )


@router.get("/agmarknet/live")
def get_agmarknet_live_feed(
    commodity: Optional[str] = Query(None, description="Filter by commodity"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Kerala, Tamil Nadu)"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Palakkad, Thrissur)"),
    market: Optional[str] = Query(None, description="Filter by market name")
):
    return fetch_agmarknet_live_data(
        commodity=commodity,
        state=state,
        district=district,
        market=market
    )


@router.post("/sync-agmarknet")
def sync_agmarknet_prices(db: Session = Depends(get_db)):
    return sync_agmarknet_to_database(db)

