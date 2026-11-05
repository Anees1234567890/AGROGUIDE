from pydantic import BaseModel
from typing import Optional, List


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"  # en, ml, hi
    conversation_history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    suggested_questions: List[str] = []
    source: str = "AgroGuide Smart Knowledge Engine"
    disclaimer: str = "AgroGuide provides general agricultural information and does not replace advice from a qualified agricultural professional or local Krishi Bhavan."
