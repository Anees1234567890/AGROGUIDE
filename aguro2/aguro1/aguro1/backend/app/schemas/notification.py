from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "System"  # Weather Alert, Market Alert, Crop Recommendation, Community Notification, System Notification
    link: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    unread_count: int
    total: int
    notifications: List[NotificationResponse]

