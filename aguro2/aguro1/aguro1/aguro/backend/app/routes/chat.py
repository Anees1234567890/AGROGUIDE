from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_service import generate_chat_response

router = APIRouter(prefix="/chat", tags=["Chatbot Assistant"])


@router.post("", response_model=ChatResponse)
async def chat_with_agroguide(request: ChatRequest):
    return await generate_chat_response(request)
