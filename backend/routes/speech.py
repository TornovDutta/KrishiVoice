from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.services.speech_service import speech_service

router = APIRouter(prefix="/speech", tags=["Gnani AI Speech Integration"])

class TranscribeRequest(BaseModel):
    audio_base64: Optional[str] = None
    language_code: str = "bn-IN"
    mock_transcript: Optional[str] = None

class SynthesizeRequest(BaseModel):
    text: str
    language_code: str = "bn-IN"
    gender: str = "female"

@router.get("/languages")
async def get_languages():
    return {"languages": speech_service.get_supported_languages()}

@router.post("/transcribe")
async def transcribe(req: TranscribeRequest):
    """
    Step 2 in KrishiVoice workflow:
    Gnani AI converts farmer's speech to text.
    """
    audio_bytes = None
    if req.audio_base64:
        import base64
        try:
            audio_bytes = base64.b64decode(req.audio_base64)
        except Exception:
            pass

    result = await speech_service.transcribe_audio(
        audio_bytes=audio_bytes,
        language_code=req.language_code,
        mock_transcript=req.mock_transcript
    )
    return result

@router.post("/synthesize")
async def synthesize(req: SynthesizeRequest):
    """
    Step 5 in KrishiVoice workflow:
    Text-to-speech delivers the response in supported language (Gnani Timbre TTS).
    """
    result = await speech_service.synthesize_speech(
        text=req.text,
        language_code=req.language_code,
        gender=req.gender
    )
    return result
