from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.models.delivery import DeliveryOrder
from app.models.user import User
from app.schemas.delivery import (
    DeliveryQuoteRequest,
    DeliveryQuoteResponse,
    DeliveryOrderCreate,
    DeliveryOrderUpdate,
    DeliveryOrderResponse,
    ConsignmentGatePass,
    DeliveryPaymentRequest,
)
from app.services.delivery_service import (
    calculate_delivery_quote,
    create_delivery_order,
    generate_gate_pass,
    process_order_payment,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/delivery", tags=["Crop Delivery & Mandi Logistics"])


@router.post("/quote", response_model=DeliveryQuoteResponse)
def get_quote(request: DeliveryQuoteRequest):
    return calculate_delivery_quote(request)


@router.post("/orders", response_model=DeliveryOrderResponse, status_code=status.HTTP_201_CREATED)
def book_delivery(
    order_in: DeliveryOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = create_delivery_order(db, order_in, current_user.id)
    return DeliveryOrderResponse.model_validate(order)


@router.get("/orders", response_model=List[DeliveryOrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Admin":
        orders = db.query(DeliveryOrder).order_by(DeliveryOrder.created_at.desc()).all()
    else:
        orders = db.query(DeliveryOrder).filter(
            DeliveryOrder.user_id == current_user.id
        ).order_by(DeliveryOrder.created_at.desc()).all()
    return [DeliveryOrderResponse.model_validate(o) for o in orders]


@router.get("/orders/{order_id}", response_model=DeliveryOrderResponse)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if current_user.role != "Admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this consignment")
    return DeliveryOrderResponse.model_validate(order)


@router.put("/orders/{order_id}/status", response_model=DeliveryOrderResponse)
def update_order_status(
    order_id: int,
    update_in: DeliveryOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if current_user.role != "Admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this consignment")

    for field, val in update_in.model_dump(exclude_unset=True).items():
        setattr(order, field, val)

    db.commit()
    db.refresh(order)
    return DeliveryOrderResponse.model_validate(order)


@router.get("/orders/{order_id}/gate-pass", response_model=ConsignmentGatePass)
def get_consignment_gate_pass(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if current_user.role != "Admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this consignment")
    try:
        return generate_gate_pass(db, order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/orders/{order_id}/pay", response_model=DeliveryOrderResponse)
def pay_for_order(
    order_id: int,
    payment_in: DeliveryPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(DeliveryOrder).filter(DeliveryOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Delivery order not found")
    if current_user.role != "Admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this consignment")
    try:
        updated = process_order_payment(db, order_id, payment_in)
        return DeliveryOrderResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
