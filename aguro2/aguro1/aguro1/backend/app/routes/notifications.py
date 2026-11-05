from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
)
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notes = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    # If no notifications exist yet for this user, seed default helpful alerts
    if len(notes) == 0:
        sample_alerts = [
            Notification(
                user_id=current_user.id,
                title="Weather Alert: Moderate Pre-Monsoon Showers",
                message=f"Scattered light rain expected across {current_user.district} over the next 48 hours. Postpone field chemical spraying.",
                type="Weather Alert",
                link="/weather",
                is_read=False
            ),
            Notification(
                user_id=current_user.id,
                title="Market Update: Black Pepper & Cardamom Surge",
                message="Black Pepper modal rates reached ₹59,500/Qtl in Kochi terminal. Check market prices for localized APMC updates.",
                type="Market Alert",
                link="/market-prices",
                is_read=False
            ),
            Notification(
                user_id=current_user.id,
                title="Crop Recommendation Advisory",
                message=f"Season shift approaching. Explore high-yield Kharif crop recommendations suited for {current_user.district} soils.",
                type="Crop Recommendation",
                link="/recommendations",
                is_read=False
            ),
            Notification(
                user_id=current_user.id,
                title="Welcome to AgroGuide!",
                message="Your digital farming companion is ready. Complete your farm profile to get personalized recommendations.",
                type="System Notification",
                link="/profile",
                is_read=True
            )
        ]
        db.add_all(sample_alerts)
        db.commit()
        notes = db.query(Notification).filter(
            Notification.user_id == current_user.id
        ).order_by(Notification.created_at.desc()).all()

    unread_count = sum(1 for n in notes if not n.is_read)

    return NotificationListResponse(
        unread_count=unread_count,
        total=len(notes),
        notifications=[NotificationResponse.model_validate(n) for n in notes]
    )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Notification not found")

    note.is_read = True
    db.commit()
    db.refresh(note)
    return NotificationResponse.model_validate(note)


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
