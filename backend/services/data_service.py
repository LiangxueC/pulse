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
    """Returns the raw cash flow data from mock — no computed fields."""
    return _mock["cashFlow"]


def get_invoices():
    return _mock["outstandingInvoices"]


def get_bills():
    return _mock["upcomingBills"]


def get_archived_cases():
    return list(_mock["archivedCases"])


# ── 1. Compute status from real balance numbers ──
def compute_status(balance: float, target_buffer: float, safe_zone: float) -> dict:
    if balance >= safe_zone:
        return {
            "status": "green",
            "statusLabel": "Green (Healthy)",
        }
    elif balance >= target_buffer:
        return {
            "status": "yellow",
            "statusLabel": "Yellow (Needs attention)",
        }
    else:
        return {
            "status": "red",
            "statusLabel": "Red (Critical)",
        }


# ── 2 & 3. Compute reasons AND steps together ──
def compute_reasons_and_steps() -> tuple[list, list]:
    reasons = []
    steps = []

    # ── Check overdue invoices ──
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
        # No step for this one — already being monitored

    # ── Check underused subscriptions ──
    subs = _mock.get("subscriptionRanking", [])
    pauseable = [s for s in subs if not s.get("recommended", False)]
    if pauseable:
        names = ", ".join(s["name"] for s in pauseable[:3])
        est_monthly = len(pauseable) * 45
        reasons.append({
            "id": "r2",
            "text": f"{len(pauseable)} underused software subscriptions are being paid for.",
            "actionTaken": None,
            "actionLabel": "Learn more",
            "actionType": "gray",
            "modalContent": {
                "title": "HOW WOULD THIS IMPACT CASH FLOW?",
                "body": [
                    f"Canceling or pausing {names} would free up an estimated ${est_monthly}/month from the very next bill cycle.",
                    "You can keep that cash in the bank to raise your projected lowest balance, or redirect it toward growth without increasing total burn."
                ]
            }
        })
        steps.append({
            "id": "s1",
            "text": f"Pick one main tool that's most beneficial, pause the others ({names}), and redirect that money into something that moves the business forward.",
            "category": "subscriptions",
        })

    # ── Check payroll vs revenue (balance proximity to buffer) ──
    cf = _mock["cashFlow"]
    balance = cf["projectedLowestBalance"]
    target = cf["targetMinimumBuffer"]
    safe = cf["safeZoneThreshold"]
    buffer_gap = balance - target

    if buffer_gap < 5000:
        reasons.append({
            "id": "r3",
            "text": "You're spending more on payroll than your revenue is growing.",
            "actionTaken": None,
            "actionLabel": "Learn more",
            "actionType": "gray",
            "modalContent": {
                "title": "HOW WOULD THIS IMPACT CASH FLOW?",
                "body": [
                    f"Your projected lowest balance is ${balance:,.0f}, only ${buffer_gap:,.0f} above your ${target:,.0f} target buffer.",
                    "Slowing hiring and trimming hours could save $500–1,200/month and keep your burn rate proportional to income."
                ]
            }
        })
        steps.append({
            "id": "s2",
            "text": "Slow down hiring, trim hours where possible, and make sure future payroll increases are tied to revenue growth.",
            "category": "payroll",
        })

    # ── Check upcoming bills spike ──
    bills = _mock.get("upcomingBills", [])
    total_bills = sum(b["amount"] for b in bills)
    if total_bills > 300:
        reasons.append({
            "id": "r4",
            "text": f"You have ${total_bills:,.0f} in upcoming bills due in the next 30 days.",
            "actionTaken": None,
            "actionLabel": "Learn more",
            "actionType": "gray",
            "modalContent": {
                "title": "HOW WOULD THIS IMPACT CASH FLOW?",
                "body": [
                    f"${total_bills:,.0f} in bills are due soon. Make sure your current balance covers these without dipping below your target buffer.",
                    "Consider collecting on overdue invoices before these bills come due."
                ]
            }
        })
        # Only add a step if not already covered
        step_ids = [s["id"] for s in steps]
        if "s3" not in step_ids:
            steps.append({
                "id": "s3",
                "text": f"Collect on overdue invoices before ${total_bills:,.0f} in upcoming bills hit. Send reminders to {', '.join(i['company'] for i in overdue[:2]) if overdue else 'clients'}.",
                "category": "invoices",
            })

    return reasons, steps


# ── Public getters used by routes ──
def get_reasons() -> list:
    reasons, _ = compute_reasons_and_steps()
    return reasons


def get_suggested_steps() -> list:
    _, steps = compute_reasons_and_steps()
    return steps


# ── 1+2: Full computed cash flow summary ──
def get_cash_flow() -> dict:
    raw = _mock["cashFlow"]
    balance = raw["projectedLowestBalance"]
    target = raw["targetMinimumBuffer"]
    safe = raw["safeZoneThreshold"]

    # Compute status from real numbers
    status_info = compute_status(balance, target, safe)

    # Issue count = number of computed reasons
    reasons, _ = compute_reasons_and_steps()
    issue_count = len([r for r in reasons if r["actionType"] == "gray"])

    return {
        **raw,
        "status": status_info["status"],
        "statusLabel": status_info["statusLabel"],
        "issueCount": issue_count,
    }