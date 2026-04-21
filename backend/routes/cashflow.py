from fastapi import APIRouter
from services.data_service import get_cash_flow, get_reasons, get_suggested_steps
from services.llm_service import explain_reason, explain_step
from services.projection_service import compute_projection

router = APIRouter()


@router.get("/detail")
def get_cashflow_detail():
    cf = get_cash_flow()
    # Replace static curve with computed projection
    cf["projectedBalanceOverTime"] = compute_projection(days=14)
    return {
        "cashFlow": cf,
        "reasons": get_reasons(),
        "suggestedNextSteps": get_suggested_steps(),
    }


@router.get("/projection")
def get_projection(days: int = 14):
    """Standalone endpoint to get the projected balance curve."""
    return {"projection": compute_projection(days=days)}


@router.get("/reasons/{reason_id}/explain")
async def explain_reason_endpoint(reason_id: str):
    reasons = get_reasons()
    reason = next((r for r in reasons if r["id"] == reason_id), None)
    if not reason:
        return {"error": "Reason not found"}
    explanation = await explain_reason(reason["text"])
    return {"reasonId": reason_id, "explanation": explanation}


@router.get("/steps/{step_id}/explain")
async def explain_step_endpoint(step_id: str):
    steps = get_suggested_steps()
    step = next((s for s in steps if s["id"] == step_id), None)
    if not step:
        return {"error": "Step not found"}
    explanation = await explain_step(step["text"])
    return {"stepId": step_id, "explanation": explanation}