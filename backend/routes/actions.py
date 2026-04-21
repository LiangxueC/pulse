from fastapi import APIRouter
from services.data_service import load_mock_data
from datetime import date

router = APIRouter()
_mock = load_mock_data()


@router.get("/subscriptions")
def get_subscription_ranking():
    return {"subscriptions": _mock["subscriptionRanking"]}


@router.get("/cash-redirects")
def get_cash_redirects():
    return {"redirects": _mock["cashRedirects"]}


@router.get("/redirect-impact/{redirect_id}")
def get_redirect_impact(redirect_id: str):
    if not redirect_id or not redirect_id.strip():
        return {"error": "Missing redirect_id"}

    impacts = _mock.get("redirectImpacts", {})
    impact = impacts.get(redirect_id)
    if not impact:
        return {"error": f"Impact not found for redirect_id: {redirect_id}"}

    cf = _mock["cashFlow"]
    base = cf["projectedBalanceOverTime"]
    increase = impact["balanceIncrease"]

    new_data = [
        {
            "day": p["day"],
            "balance": p["balance"] + int(increase * (p["day"] / 14)),
        }
        for p in base
    ]

    return {
        "redirectId": redirect_id,
        "description": impact["description"],
        "monthlySaving": impact["monthlySaving"],
        "balanceIncrease": increase,
        "currentData": base,
        "newData": new_data,
    }


@router.post("/execute")
def execute_action(body: dict):
    # ── Input validation ──
    category = body.get("category", "").strip()
    step_text = body.get("stepText", "").strip()

    if not category:
        return {
            "error": "Missing required field: category",
            "summary": "Could not process action — no category provided.",
            "bullets": [],
            "impact": "Please try again.",
            "monthlySaving": 0,
            "balanceLift": 0,
        }

    subs = _mock.get("subscriptionRanking", [])

    if category == "subscriptions":
        keep = [s for s in subs if s.get("recommended")]
        pause = [s for s in subs if not s.get("recommended")]

        if not pause:
            return {
                "category": category,
                "summary": "No subscriptions were flagged for pausing.",
                "bullets": [],
                "impact": "Your subscription costs appear to already be optimized.",
                "monthlySaving": 0,
                "balanceLift": 0,
            }

        monthly_saving = len(pause) * 45
        balance_lift = monthly_saving * 0.7
        return {
            "category": category,
            "summary": (
                f"I've paused {len(pause)} underused subscription"
                f"{'s' if len(pause) != 1 else ''} and kept "
                f"{keep[0]['name'] if keep else 'your main tool'} as your primary tool:"
            ),
            "bullets": [s["name"] for s in pause],
            "impact": (
                f"Monthly spend reduced by ~${monthly_saving}. "
                f"Your projected cash floor for the next 14 days is now "
                f"${balance_lift:,.0f} higher than before."
            ),
            "monthlySaving": monthly_saving,
            "balanceLift": balance_lift,
        }

    elif category == "payroll":
        monthly_saving = 1200
        balance_lift = monthly_saving * 0.6
        return {
            "category": category,
            "summary": "I've flagged the following for review to reduce payroll overhead:",
            "bullets": [
                "2 open job postings paused",
                "3 part-time roles flagged for reduced hours",
                "Future raise reviews tied to revenue milestones",
            ],
            "impact": (
                f"Estimated monthly savings of ${monthly_saving:,}. "
                f"Your projected cash floor for the next 14 days is now "
                f"${balance_lift:,.0f} higher than before."
            ),
            "monthlySaving": monthly_saving,
            "balanceLift": balance_lift,
        }

    elif category == "invoices":
        invoices = _mock.get("outstandingInvoices", [])
        overdue = [i for i in invoices if i.get("daysOverdue", 0) > 0]

        if not overdue:
            return {
                "category": category,
                "summary": "No overdue invoices were found to action.",
                "bullets": [],
                "impact": "All invoices appear to be current.",
                "monthlySaving": 0,
                "balanceLift": 0,
            }

        total_overdue = sum(i["amount"] for i in overdue)
        balance_lift = total_overdue * 0.6
        return {
            "category": category,
            "summary": (
                f"I've sent payment reminders to {len(overdue)} "
                f"{'company' if len(overdue) == 1 else 'companies'} "
                f"with outstanding invoices:"
            ),
            "bullets": [
                f"{i['company']} — ${i['amount']:,.2f} "
                f"({i['daysOverdue']} day{'s' if i['daysOverdue'] != 1 else ''} overdue)"
                for i in overdue
            ],
            "impact": (
                f"If collected, outstanding invoices totaling ${total_overdue:,.2f} "
                f"would raise your projected cash floor by approximately "
                f"${balance_lift:,.0f} over the next 14 days."
            ),
            "monthlySaving": 0,
            "balanceLift": balance_lift,
        }

    # ── Fallback for unknown category ──
    return {
        "category": category,
        "summary": "I've noted your selected action and flagged it for review.",
        "bullets": [step_text] if step_text else ["Action recorded"],
        "impact": "Monitor your cash balance over the next 14 days to track the effect.",
        "monthlySaving": 0,
        "balanceLift": 0,
    }


@router.post("/close")
def close_case(body: dict):
    from routes.cases import _load_cases, _save_cases

    steps_taken = body.get("stepsTaken", [])
    steps_skipped = body.get("stepsSkipped", [])

    if not isinstance(steps_taken, list):
        steps_taken = []
    if not isinstance(steps_skipped, list):
        steps_skipped = []

    today = date.today()

    topics = list({
        s.get("category", "general")
        for s in steps_taken + steps_skipped
        if isinstance(s, dict)
    })

    topic_labels = {
        "subscriptions": "underused subscriptions",
        "payroll": "payroll vs revenue",
        "invoices": "late invoices",
    }

    label_parts = [topic_labels.get(t, t) for t in topics] if topics else ["general review"]

    # Cross-platform date format
    label = (
        f"{today.month}/{today.day}/{str(today.year)[2:]}: "
        f"{', '.join(label_parts).capitalize()}"
    )

    cases = _load_cases()
    new_case = {
        "id": f"case{len(cases) + 1}",
        "date": today.isoformat(),
        "label": label,
    }
    cases.insert(0, new_case)
    _save_cases(cases)

    return {"success": True, "case": new_case}