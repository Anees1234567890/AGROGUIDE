from app.routes.auth import router as auth_router
from app.routes.crops import router as crops_router
from app.routes.recommendations import router as recommendations_router
from app.routes.weather import router as weather_router
from app.routes.market import router as market_router
from app.routes.pests import router as pests_router
from app.routes.chat import router as chat_router
from app.routes.community import router as community_router
from app.routes.professionals import router as professionals_router
from app.routes.notifications import router as notifications_router
from app.routes.admin import router as admin_router
from app.routes.delivery import router as delivery_router

__all__ = [
    "auth_router",
    "crops_router",
    "recommendations_router",
    "weather_router",
    "market_router",
    "pests_router",
    "chat_router",
    "community_router",
    "professionals_router",
    "notifications_router",
    "admin_router",
    "delivery_router",
]


