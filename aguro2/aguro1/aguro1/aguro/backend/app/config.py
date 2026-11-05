import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AgroGuide"
    APP_ENV: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./agroguide.db"

    # Security
    SECRET_KEY: str = "agroguide_secret_super_key_2026_change_in_production_jwt99"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Demo & External APIs
    DEMO_MODE: bool = True
    WEATHER_API_KEY: str = ""
    AI_API_KEY: str = ""
    AI_PROVIDER: str = "gemini"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

