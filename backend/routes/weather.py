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
    Module B: Voice-based weather and farming alerts.
    Retrieves practical agricultural weather advisories (irrigation & spraying guidance).
    """
    forecast = weather_service.get_weather_forecast(district=district, query=query, language=language)
    return forecast
