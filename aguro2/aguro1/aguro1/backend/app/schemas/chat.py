from pydantic import BaseModel
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class StructuredGuidance(BaseModel):
    intent: Optional[str] = None
    crop: Optional[str] = None
    steps: List[str] = []
    npk_dosage: Optional[str] = None
    spray_schedule: Optional[str] = None
    organic_treatment: Optional[str] = None
    chemical_treatment: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # en, ml, hi
    conversation: Optional[List[ChatMessage]] = None
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    suggested_questions: List[str] = []
    structured_guidance: Optional[StructuredGuidance] = None
    source: str = "AgroGuide Groq AI Engine"
    disclaimer: str = "AgroGuide provides AI agricultural advisory. Confirm with a local agricultural officer for regulated chemical interventions."

