import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes import crop, weather, mandi, diary, expert, farmer, speech

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("krishivoice")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting KrishiVoice FastAPI backend...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down KrishiVoice FastAPI backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KrishiVoice: Voice-First AI Agricultural Assistant for Indian Farmers",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(crop.router, prefix=settings.API_V1_PREFIX)
app.include_router(weather.router, prefix=settings.API_V1_PREFIX)
app.include_router(mandi.router, prefix=settings.API_V1_PREFIX)
app.include_router(diary.router, prefix=settings.API_V1_PREFIX)
app.include_router(expert.router, prefix=settings.API_V1_PREFIX)
app.include_router(farmer.router, prefix=settings.API_V1_PREFIX)
app.include_router(speech.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "app": "KrishiVoice API",
        "description": "An AI farming assistant that speaks the farmer's language",
        "status": "online",
        "supported_languages": ["bn-IN (Bengali)", "hi-IN (Hindi)", "en-IN (English)"],
        "modules": [
            "Crop problem assistant (ICAR/IRRI RAG)",
            "Voice-based weather and farming alerts",
            "Mandi market price assistant",
            "Farm diary and reminders",
            "Connect to agricultural expert (KVK/Kisan Call Centre)",
            "Personal farm memory"
        ],
        "speech_engine": "Gnani AI (Prisma ASR + Timbre TTS)",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
