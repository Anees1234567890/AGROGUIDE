import httpx
from typing import List, Optional
import logging
from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AgroGuide, an AI agricultural assistant. Answer the user's questions dynamically using your knowledge and reasoning. Do not use predefined answers. The user's exact message should determine your response.

Focus on agriculture, farming, crops, soil, fertilizers, irrigation, pests, plant diseases, crop management, harvesting, seeds, and related topics.

If important information is missing, ask the user for it instead of guessing.

Give practical, understandable answers. When appropriate, provide symptoms, possible causes, prevention, and recommended next steps.

For pesticide or chemical recommendations, emphasize following the product label and appropriate agricultural guidance.

If the question is unrelated to agriculture, politely explain that AgroGuide is primarily designed for agriculture-related assistance.

Never claim that an answer came from a predefined database. Generate the response dynamically."""

GROQ_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "allam-2-7b",
]


async def call_groq_api(messages: List[dict]) -> Optional[str]:
    api_key = settings.GROQ_API_KEY  # Hardcoded fallback key remove cheythu
    if not api_key:
        logger.error("GROQ_API_KEY is missing")
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    for model in GROQ_MODELS:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1024,
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                else:
                    logger.warning(f"Groq model {model} status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.error(f"Error calling Groq API model {model}: {e}")
            continue

    return None


async def generate_chat_response(request: ChatRequest) -> ChatResponse:
    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Maintain multi-turn conversation memory
    history = request.conversation or request.conversation_history or []
    for msg in history:
        # Ignore system messages or empty strings in history
        if msg.role in ["user", "assistant"] and msg.content and msg.content != request.message:
            groq_messages.append({"role": msg.role, "content": msg.content})

    user_prompt = request.message
    if request.language and request.language.lower() in ["ml", "malayalam"]:
        user_prompt += " (Please respond in Malayalam / മലയാളം)"
    elif request.language and request.language.lower() in ["hi", "hindi"]:
        user_prompt += " (Please respond in Hindi / हिन्दी)"

    groq_messages.append({"role": "user", "content": user_prompt})

    ai_response = await call_groq_api(groq_messages)

    if not ai_response:
        ai_response = (
            "I apologize, but I am unable to connect to the Groq AI service right now. "
            "Please check your network connection or try asking your question again in a moment."
        )

    return ChatResponse(
        response=ai_response,
        suggested_questions=[],
        source="Groq AI Engine",
        disclaimer="AgroGuide provides AI agricultural advisory generated dynamically by Groq. Verify chemical dosages with local Krishi Bhavan officers."
    )