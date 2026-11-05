import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "agroguide.db").replace("\\", "/")


class Settings(BaseSettings):
    APP_NAME: str = "AgroGuide"
    APP_ENV: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"

    # Security
    SECRET_KEY: str = "agroguide_secret_super_key_2026_change_in_production_jwt99"
    ADMIN_SECRET_KEY: str = "AGROGUIDE_ADMIN_2026_SECRET"
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
    AI_PROVIDER: str = "groq"
    GROQ_API_KEY: str = "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"

    # SMTP Email (optional – leave blank to use dev-mode console fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "AgroGuide"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")



settings = Settings()

