from fastapi import APIRouter, Query
from services.data_service import get_cash_flow, get_reasons, get_suggested_steps
from services.llm_service import explain_step
from services.projection_service import compute_projection

router = APIRouter()


@router.get("/detail")
def get_cashflow_detail(
    completed: list[str] = Query(default=[])
):
    """
    completed: list of category strings already actioned
    e.g. ?completed=subscriptions
    Returns updated balance, status, reasons, steps with completed ones filtered out
    """
    cf = get_cash_flow(completed)
    cf["projectedBalanceOverTime"] = compute_projection(days=30)
    return {
        "cashFlow": cf,
        "reasons": get_reasons(completed),
        "suggestedNextSteps": get_suggested_steps(completed),
    }


@router.get("/steps/{step_id}/explain")
async def explain_step_endpoint(step_id: str):
    """Ask Gemini to explain a suggested next step."""
    steps = get_suggested_steps()
    step = next((s for s in steps if s["id"] == step_id), None)
    if not step:
        return {"error": "Step not found"}
    explanation = await explain_step(step["text"])
    return {"stepId": step_id, "explanation": explanation}


@router.get("/projection")
def get_projection(days: int = 30):
    return {"projection": compute_projection(days=days)}