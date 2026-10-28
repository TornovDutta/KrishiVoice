import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiVoice API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "krishivoice")
    
    # Gnani AI Configuration
    # Official Gnani APIs: Prisma (ASR / STT) and Timbre (TTS)
    GNANI_API_KEY: Optional[str] = os.getenv("GNANI_API_KEY", "")
    GNANI_TOKEN: Optional[str] = os.getenv("GNANI_TOKEN", "")
    GNANI_ASR_URL: str = os.getenv("GNANI_ASR_URL", "https://api.gnani.ai/v1/prisma/asr")
    GNANI_TTS_URL: str = os.getenv("GNANI_TTS_URL", "https://api.gnani.ai/v1/timbre/tts")
    
    # LLM / AI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    
    # Weather & Mandi
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY", "")
    AGMARKNET_API_KEY: Optional[str] = os.getenv("AGMARKNET_API_KEY", "")
    
    # Default localization
    DEFAULT_LANGUAGE: str = "bn-IN"  # Bengali default as highlighted in KrishiVoice vision
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
