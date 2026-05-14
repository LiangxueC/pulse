import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from db import get_session
from models import (
    Company, CashFlowConfig, CashFlowProjection,
    Invoice, Bill, Subscription, CashRedirect, RedirectImpact,
)


def get_company() -> dict:
    with get_session() as session:
        row = session.query(Company).first()
        return {"id": row.id, "name": row.name, "user": row.user}


def get_invoices() -> list[dict]:
    with get_session() as session:
        rows = session.query(Invoice).all()
        return [
            {
                "id": r.id,
                "company": r.company,
                "daysOverdue": r.days_overdue,
                "amount": r.amount,
                "status": r.status,
            }
            for r in rows
        ]


def get_bills() -> list[dict]:
    with get_session() as session:
        rows = session.query(Bill).all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "dueDate": r.due_date,
                "dueDateLabel": r.due_date_label,
                "amount": r.amount,
            }
            for r in rows
        ]


def get_raw_cash_flow() -> dict:
    with get_session() as session:
        cfg = session.query(CashFlowConfig).first()
        projection = (
            session.query(CashFlowProjection)
            .order_by(CashFlowProjection.day)
            .all()
        )
        return {
            "projectedLowestBalance": cfg.projected_lowest_balance,
            "targetMinimumBuffer": cfg.target_minimum_buffer,
            "safeZoneThreshold": cfg.safe_zone_threshold,
            "projectedBalanceOverTime": [
                {"day": p.day, "balance": p.balance} for p in projection
            ],
        }


def get_subscriptions() -> list[dict]:
    with get_session() as session:
        rows = session.query(Subscription).all()
        return [{"id": r.id, "name": r.name, "recommended": r.recommended} for r in rows]


def get_cash_redirects() -> list[dict]:
    with get_session() as session:
        rows = session.query(CashRedirect).all()
        return [{"id": r.id, "text": r.text} for r in rows]


def get_redirect_impact(redirect_id: str) -> dict | None:
    with get_session() as session:
        row = session.query(RedirectImpact).filter_by(redirect_id=redirect_id).first()
        if not row:
            return None
        return {
            "redirectId": row.redirect_id,
            "description": row.description,
            "monthlySaving": row.monthly_saving,
            "balanceIncrease": row.balance_increase,
        }


def compute_status(balance: float, target_buffer: float, safe_zone: float) -> dict:
    if balance >= safe_zone:
        return {"status": "green", "statusLabel": "Green (Healthy)"}
    elif balance >= target_buffer:
        return {"status": "yellow", "statusLabel": "Yellow (Needs attention)"}
    else:
        return {"status": "red", "statusLabel": "Red (Critical)"}


def compute_reasons_and_steps(completed_categories: list[str] = []) -> tuple[list, list]:
    reasons = []
    steps = []

    invoices = get_invoices()
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

    subs = get_subscriptions()
    pauseable = [s for s in subs if not s.get("recommended", False)]
    if pauseable and "subscriptions" not in completed_categories:
        names = ", ".join(s["name"] for s in pauseable[:3])
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

    cf = get_raw_cash_flow()
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
    base = get_raw_cash_flow()["projectedLowestBalance"]
    improvement = 0.0
    if "subscriptions" in completed_categories:
        improvement += 126
    if "payroll" in completed_categories:
        improvement += 720
    return base + improvement


def get_cash_flow(completed_categories: list[str] = []) -> dict:
    raw = get_raw_cash_flow()
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
