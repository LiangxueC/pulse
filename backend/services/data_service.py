import json
from pathlib import Path

_DATA_PATH = Path(__file__).parent.parent / "data" / "mockData.json"


def load_mock_data() -> dict:
    with open(_DATA_PATH, "r") as f:
        return json.load(f)


_mock = load_mock_data()


def get_company():
    return _mock["company"]


def get_raw_cash_flow():
    return _mock["cashFlow"]


def get_invoices():
    return _mock["outstandingInvoices"]


def get_bills():
    return _mock["upcomingBills"]


def get_archived_cases():
    return list(_mock["archivedCases"])


def compute_status(balance: float, target_buffer: float, safe_zone: float) -> dict:
    if balance >= safe_zone:
        return {"status": "green", "statusLabel": "Green (Healthy)"}
    elif balance >= target_buffer:
        return {"status": "yellow", "statusLabel": "Yellow (Needs attention)"}
    else:
        return {"status": "red", "statusLabel": "Red (Critical)"}


def compute_reasons_and_steps(completed_categories: list[str] = []) -> tuple[list, list]:
    """
    completed_categories: list of category strings already actioned this session
    e.g. ["subscriptions"] means subscription step is done, skip it
    """
    reasons = []
    steps = []

    # ── Overdue invoice reason (keep on reason card, no step) ──
    invoices = _mock.get("outstandingInvoices", [])
    overdue = [i for i in invoices if i.get("daysOverdue", 0) > 0]
    if overdue:
        worst = max(overdue, key=lambda x: x["amount"])
        reasons.append({
            "id": "r1",
            "text": f"{worst['company']} owes you ${worst['amount']:,.0f} and is {worst['daysOverdue']} days late.",
            "actionTaken": "keep monitoring",
            "actionLabel": "Action taken: keep monitoring",
            "actionType": "green",
        })
        # No step generated for invoices

    # ── Subscription reason + step ──
    subs = _mock.get("subscriptionRanking", [])
    pauseable = [s for s in subs if not s.get("recommended", False)]
    if pauseable and "subscriptions" not in completed_categories:
        names = ", ".join(s["name"] for s in pauseable[:3])
        est_monthly = len(pauseable) * 45
        reasons.append({
            "id": "r2",
            "text": f"{len(pauseable)} underused software subscriptions are being paid for.",
            "actionTaken": None,
            "actionLabel": None,
            "actionType": "gray",
        })
        steps.append({
            "id": "s1",
            "text": f"Pick one main tool that's most beneficial, pause the others ({names}), and redirect that money into something that moves the business forward.",
            "category": "subscriptions",
        })

    # ── Payroll reason + step ──
    cf = _mock["cashFlow"]
    balance = cf["projectedLowestBalance"]
    target = cf["targetMinimumBuffer"]
    safe = cf["safeZoneThreshold"]
    buffer_gap = balance - target

    if buffer_gap < 5000 and "payroll" not in completed_categories:
        reasons.append({
            "id": "r3",
            "text": "You're spending more on payroll than your revenue is growing.",
            "actionTaken": None,
            "actionLabel": None,
            "actionType": "gray",
        })
        steps.append({
            "id": "s2",
            "text": "Slow down hiring, trim hours where possible, and make sure future payroll increases are tied to revenue growth.",
            "category": "payroll",
        })

    return reasons, steps


def get_reasons(completed_categories: list[str] = []) -> list:
    reasons, _ = compute_reasons_and_steps(completed_categories)
    return reasons


def get_suggested_steps(completed_categories: list[str] = []) -> list:
    _, steps = compute_reasons_and_steps(completed_categories)
    return steps


def compute_projected_balance(completed_categories: list[str] = []) -> float:
    """
    Compute balance improvement when steps are completed.
    subscriptions: saves ~$180/month → ~$126 improvement on 30-day floor
    payroll: saves ~$1200/month → ~$720 improvement on 30-day floor
    """
    base = _mock["cashFlow"]["projectedLowestBalance"]
    improvement = 0.0
    if "subscriptions" in completed_categories:
        improvement += 126
    if "payroll" in completed_categories:
        improvement += 720
    return base + improvement


def get_cash_flow(completed_categories: list[str] = []) -> dict:
    raw = _mock["cashFlow"]
    balance = compute_projected_balance(completed_categories)
    target = raw["targetMinimumBuffer"]
    safe = raw["safeZoneThreshold"]
    status_info = compute_status(balance, target, safe)
    reasons, _ = compute_reasons_and_steps(completed_categories)
    issue_count = len([r for r in reasons if r["actionType"] == "gray"])
    return {
        **raw,
        "projectedLowestBalance": balance,
        "status": status_info["status"],
        "statusLabel": status_info["statusLabel"],
        "issueCount": issue_count,
    }