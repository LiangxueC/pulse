import os
import google.generativeai as genai
from services.data_service import get_cash_flow, get_reasons, get_suggested_steps

api_key = os.environ.get("GOOGLE_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

MODEL = "gemini-2.5-flash-lite"


def _build_system_prompt() -> str:
    cf = get_cash_flow()
    reasons = get_reasons()
    steps = get_suggested_steps()
    reasons_text = "\n".join(f"- {r['text']}" for r in reasons)
    steps_text = "\n".join(f"- {s['text']}" for s in steps)
    return f"""You are Pulse, an intelligent financial advisor built into QuickBooks.
You help small business owners understand their cash flow health and take action.

Current financial context:
- Projected lowest cash balance (next 30 days): ${cf['projectedLowestBalance']:,.2f}
- Status: {cf['statusLabel']}
- Target minimum buffer: ${cf['targetMinimumBuffer']:,.2f}

Key issues identified:
{reasons_text}

Suggested next steps:
{steps_text}

Keep responses concise (2-4 sentences), warm, and actionable.
Speak directly to the business owner. Use plain language, avoid jargon.
Never make up financial numbers not provided above."""


async def chat_with_pulse(messages: list[dict]) -> str:
    if not api_key:
        return "GOOGLE_API_KEY is not set. Please add it to your backend/.env file."
    try:
        model = genai.GenerativeModel(
            model_name=MODEL,
            system_instruction=_build_system_prompt(),
        )
        history = [
            {
                "role": "model" if m["role"] == "assistant" else "user",
                "parts": [m["content"]],
            }
            for m in messages[:-1]
        ]
        chat = model.start_chat(history=history)
        response = await chat.send_message_async(messages[-1]["content"])
        return response.text
    except Exception as e:
        return f"Sorry, I couldn't connect right now. Error: {str(e)}"


async def explain_step(step_text: str) -> str:
    """Gemini explains why a suggested step helps cash flow."""
    return await chat_with_pulse([{
        "role": "user",
        "content": (
            f"Explain why this next step would help my cash flow and how to act on it:\n\n"
            f"{step_text}\n\nKeep it to 2-3 short paragraphs. Be specific and practical."
        ),
    }])


async def explain_action_feedback(
    feedback: str,
    category: str,
    current_result: dict,
) -> str:
    summary = current_result.get("summary", "")
    bullets = "\n".join(f"- {b}" for b in current_result.get("bullets", []))
    impact = current_result.get("impact", "")
    prompt = f"""The user just reviewed an action I took and wants a change.

What I did ({category}):
{summary}
{bullets}

Impact: {impact}

User feedback: "{feedback}"

Acknowledge their feedback, explain what you would change and why,
and give a revised recommendation in 2-3 sentences."""
    return await chat_with_pulse([{"role": "user", "content": prompt}])


async def generate_payroll_summary() -> str:
    """Generate a Pulse summary for the payroll case — no redirects needed."""
    return await chat_with_pulse([{
        "role": "user",
        "content": (
            "The user has chosen to slow down hiring, trim hours where possible, "
            "and tie future payroll increases to revenue growth. "
            "Give a brief, encouraging summary (3-4 sentences) of what this means "
            "for their cash flow over the next 14-30 days. Be specific and practical. "
            "End with one concrete first action they can take today."
        ),
    }])