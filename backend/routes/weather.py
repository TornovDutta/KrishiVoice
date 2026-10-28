from fastapi import APIRouter, Query
from typing import Optional
from backend.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather and Farming Alerts"])

@router.get("/forecast")
async def get_forecast(
    district: str = Query("Purba Bardhaman", description="Farmer district"),
    query: Optional[str] = Query(None, description="Spoken question e.g. 'Will it rain tomorrow?'"),
    language: str = Query("bn-IN", description="Preferred language code")
):
    """
    Module B: Voice-based real-time weather and farming alerts.
    Fetches 100% REAL live weather metrics and synthesizes agronomical irrigation and spraying advice.
    """
    forecast = await weather_service.get_live_weather(district=district, query=query, language=language)
    return forecast
