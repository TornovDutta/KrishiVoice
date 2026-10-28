from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.services.expert_service import expert_service

router = APIRouter(prefix="/expert", tags=["Connect to Agricultural Expert"])

class EscalateRequest(BaseModel):
    farmer_id: str = "farmer_user"
    crop: str
    symptoms: str
    growth_stage: Optional[str] = None
    severity: str = "High"
    notes: Optional[str] = None
    image_url: Optional[str] = None

@router.post("/escalate")
async def escalate_case(req: EscalateRequest):
    """
    Module E: Connect to an agricultural expert.
    Synthesizes concise case summary and prepares KVK / Kisan Call Centre referral.
    """
    case = await expert_service.create_expert_case(
        farmer_id=req.farmer_id,
        crop=req.crop,
        symptoms=req.symptoms,
        growth_stage=req.growth_stage,
        severity=req.severity,
        notes=req.notes,
        image_url=req.image_url
    )
    return case

@router.get("/cases")
async def list_cases(farmer_id: str = "farmer_user"):
    cases = await expert_service.get_cases_for_farmer(farmer_id)
    return {"cases": cases}
