from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from backend.services.crop_assistant_service import crop_assistant_service

router = APIRouter(prefix="/crop", tags=["Crop Problem Assistant"])

class CropQueryRequest(BaseModel):
    farmer_id: str = "farmer_wb_001"
    query_text: str
    language: str = "bn-IN"
    follow_up_answers: Optional[Dict[str, str]] = None

@router.post("/analyze")
async def analyze_crop(request: CropQueryRequest):
    """
    Module A: Crop problem assistant.
    Analyzes symptoms from natural spoken text, asks follow-up questions,
    and returns grounded agricultural guidance with safe next steps and citations.
    """
    if not request.query_text.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")
    
    result = await crop_assistant_service.analyze_crop_issue(
        farmer_id=request.farmer_id,
        voice_query=request.query_text,
        language=request.language,
        follow_up_answers=request.follow_up_answers
    )
    return result
