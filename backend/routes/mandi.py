from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.services.mandi_service import mandi_service

router = APIRouter(prefix="/mandi", tags=["Mandi Price Assistant"])

class RecordPriceRequest(BaseModel):
    commodity: str
    local_name: Optional[str] = None
    market: str
    district: str = "Purba Bardhaman"
    modal_price: float
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    source: Optional[str] = "Farmer / Local Mandi Trader"

@router.get("/prices")
async def get_prices(
    commodity: Optional[str] = Query(None, description="Crop name (e.g. paddy, rice, potato, tomato)"),
    district: Optional[str] = Query(None, description="District filter (e.g. Bardhaman, Hooghly)"),
    language: str = Query("bn-IN", description="Preferred language code")
):
    """
    Module C: Mandi price assistant.
    Returns authentic commodity prices from MongoDB.
    """
    result = await mandi_service.get_mandi_prices(
        commodity=commodity,
        district=district,
        language=language
    )
    return result

@router.post("/add-rate")
async def add_rate(req: RecordPriceRequest):
    """
    Records a real agricultural market price into MongoDB.
    """
    if req.modal_price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    res = await mandi_service.record_mandi_price(req.dict())
    return res
