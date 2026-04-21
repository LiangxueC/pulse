from fastapi import APIRouter
from pydantic import BaseModel, field_validator
from services.llm_service import chat_with_pulse, explain_action_feedback

router = APIRouter()

MAX_MESSAGES = 20


class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in ("user", "assistant"):
            raise ValueError("role must be 'user' or 'assistant'")
        return v

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("content must not be empty")
        return v.strip()


class ChatRequest(BaseModel):
    messages: list[ChatMessage]

    @field_validator("messages")
    @classmethod
    def messages_must_not_be_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("messages list must not be empty")
        return v


class FeedbackRequest(BaseModel):
    feedback: str
    category: str
    currentResult: dict

    @field_validator("feedback")
    @classmethod
    def feedback_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("feedback must not be empty")
        return v.strip()

    @field_validator("category")
    @classmethod
    def category_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("category must not be empty")
        return v.strip()


@router.post("/")
async def chat(body: ChatRequest):
    messages = [
        {"role": m.role, "content": m.content}
        for m in body.messages
    ]
    # Trim to last MAX_MESSAGES to avoid Gemini token limit errors
    messages = messages[-MAX_MESSAGES:]
    reply = await chat_with_pulse(messages)
    return {"reply": reply}


@router.post("/action-feedback")
async def action_feedback(body: FeedbackRequest):
    reply = await explain_action_feedback(
        feedback=body.feedback,
        category=body.category,
        current_result=body.currentResult,
    )
    return {"reply": reply}