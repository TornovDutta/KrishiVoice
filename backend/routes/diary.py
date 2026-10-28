from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.services.farm_diary_service import farm_diary_service

router = APIRouter(prefix="/diary", tags=["Farm Diary and Reminders"])

class SpokenLogRequest(BaseModel):
    farmer_id: str = "farmer_user"
    spoken_text: str
    language: str = "bn-IN"

class ToggleReminderRequest(BaseModel):
    reminder_id: str
    completed: bool

@router.post("/voice-log")
async def add_voice_log(req: SpokenLogRequest):
    """
    Module D: Farm diary voice logging.
    E.g. 'I planted paddy on 15 July in Field A'
    Interprets natural spoken input and generates dynamic calendar reminders in MongoDB.
    """
    if not req.spoken_text.strip():
        raise HTTPException(status_code=400, detail="Spoken text cannot be empty")
    
    result = await farm_diary_service.add_voice_log(
        farmer_id=req.farmer_id,
        spoken_text=req.spoken_text,
        language=req.language
    )
    return result

@router.get("/reminders")
async def get_reminders(farmer_id: str = "farmer_user"):
    """
    Retrieves all authentic crop activity reminders stored in MongoDB.
    """
    reminders = await farm_diary_service.get_reminders(farmer_id)
    return {"reminders": reminders}

@router.post("/reminders/toggle")
async def toggle_reminder(req: ToggleReminderRequest):
    """
    Toggles completion status of a reminder.
    """
    success = await farm_diary_service.toggle_reminder(req.reminder_id, req.completed)
    return {"success": success, "reminder_id": req.reminder_id, "completed": req.completed}
