import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database.session import engine, Base
from app.database.migrate import ensure_delivery_order_columns
import app.models  # Load all models
from app.routes import (
    auth_router,
    crops_router,
    recommendations_router,
    weather_router,
    market_router,
    pests_router,
    chat_router,
    community_router,
    professionals_router,
    notifications_router,
    admin_router,
    delivery_router,
)

from app.database.session import SessionLocal
from app.database.seed_users import ensure_default_demo_users
from app.database.seed_market import ensure_kerala_market_prices

uploads_path = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_path, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically generate tables if they don't exist
    Base.metadata.create_all(bind=engine)
    ensure_delivery_order_columns(engine)
    db = SessionLocal()
    try:
        ensure_default_demo_users(db)
        ensure_kerala_market_prices(db)
    finally:
        db.close()
    yield


# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="AgroGuide REST API — Smart Farming Advisory Platform for Crop Recommendations, Live Weather, Market Mandi Prices, Multilingual Chatbot, Crop Disease Consultations, and Agricultural Community Support.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for seamless local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for serving uploaded disease images
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")


# Include API Routers under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(crops_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(market_router, prefix="/api")
app.include_router(pests_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(community_router, prefix="/api")
app.include_router(professionals_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(delivery_router, prefix="/api")




@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "Smart Farming. Better Decisions.",
        "status": "online",
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE,
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "demo_mode": settings.DEMO_MODE
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
