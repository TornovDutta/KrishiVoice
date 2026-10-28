from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.services.farmer_memory_service import farmer_memory_service

router = APIRouter(prefix="/farmer", tags=["Personal Farm Memory"])

class FarmerProfilePayload(BaseModel):
    name: str
    native_name: Optional[str] = None
    phone: Optional[str] = None
    state: str = "West Bengal"
    district: str = "Purba Bardhaman"
    village: Optional[str] = None
    preferred_language: str = "bn-IN"
    land_size_bigha: Optional[float] = None
    land_size_acre: Optional[float] = None
    soil_type: Optional[str] = None
    active_crops: Optional[List[Dict[str, Any]]] = None

@router.get("/profile")
async def get_profile(farmer_id: str = "farmer_user"):
    """
    Module F: Personal farm memory.
    Retrieves the authentic registered farmer profile from MongoDB.
    """
    profile = await farmer_memory_service.get_profile(farmer_id)
    if not profile:
        return {"registered": False, "profile": None}
    return {"registered": True, "profile": profile}

@router.post("/onboard")
async def onboard_farmer(farmer_id: str, payload: FarmerProfilePayload):
    """
    Registers the real farmer's information into MongoDB.
    """
    data = payload.dict()
    res = await farmer_memory_service.save_or_update_profile(farmer_id, data)
    return res

@router.put("/profile")
async def update_profile(farmer_id: str, payload: FarmerProfilePayload):
    data = {k: v for k, v in payload.dict().items() if v is not None}
    res = await farmer_memory_service.save_or_update_profile(farmer_id, data)
    return res

@router.get("/history")
async def get_history(farmer_id: str = "farmer_user", limit: int = 15):
    history = await farmer_memory_service.get_conversation_history(farmer_id, limit)
    return {"history": history}
