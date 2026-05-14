"""Seed the SQLite database from mockData.json and archivedCases.json."""
import json
from pathlib import Path
from db import engine, get_session
from models import (
    Base, Company, CashFlowConfig, CashFlowProjection,
    Invoice, Bill, Subscription, CashRedirect, RedirectImpact, ArchivedCase,
)

_DATA_DIR = Path(__file__).parent / "data"


def seed():
    Base.metadata.create_all(engine)

    mock = json.loads((_DATA_DIR / "mockData.json").read_text())
    cases_path = _DATA_DIR / "archivedCases.json"

    with get_session() as session:
        # Skip if already seeded
        if session.query(Company).first():
            return

        co = mock["company"]
        company_id = co["id"]
        session.add(Company(id=company_id, name=co["name"], user=co["user"]))

        cf = mock["cashFlow"]
        session.add(CashFlowConfig(
            company_id=company_id,
            projected_lowest_balance=cf["projectedLowestBalance"],
            target_minimum_buffer=cf["targetMinimumBuffer"],
            safe_zone_threshold=cf["safeZoneThreshold"],
        ))

        for point in cf["projectedBalanceOverTime"]:
            session.add(CashFlowProjection(
                company_id=company_id,
                day=point["day"],
                balance=point["balance"],
            ))

        for inv in mock["outstandingInvoices"]:
            session.add(Invoice(
                id=inv["id"],
                company_id=company_id,
                company=inv["company"],
                days_overdue=inv.get("daysOverdue", 0),
                amount=inv["amount"],
                status=inv.get("status", "overdue"),
            ))

        for bill in mock["upcomingBills"]:
            session.add(Bill(
                id=bill["id"],
                company_id=company_id,
                name=bill["name"],
                due_date=bill["dueDate"],
                due_date_label=bill["dueDateLabel"],
                amount=bill["amount"],
            ))

        for sub in mock["subscriptionRanking"]:
            session.add(Subscription(
                id=sub["id"],
                company_id=company_id,
                name=sub["name"],
                recommended=sub.get("recommended", False),
            ))

        for redirect in mock["cashRedirects"]:
            session.add(CashRedirect(
                id=redirect["id"],
                company_id=company_id,
                text=redirect["text"],
            ))

        for rid, impact in mock["redirectImpacts"].items():
            session.add(RedirectImpact(
                redirect_id=rid,
                company_id=company_id,
                description=impact["description"],
                monthly_saving=impact["monthlySaving"],
                balance_increase=impact["balanceIncrease"],
            ))

        # Load archived cases from archivedCases.json if it exists, else from mockData
        if cases_path.exists():
            archived = json.loads(cases_path.read_text())
        else:
            archived = mock.get("archivedCases", [])

        for case in archived:
            # Parse integer out of IDs like "case1", "case17"
            raw_id = case["id"].replace("case", "")
            try:
                int_id = int(raw_id)
            except ValueError:
                int_id = None
            session.add(ArchivedCase(
                id=int_id,
                company_id=company_id,
                date=case["date"],
                label=case["label"],
            ))


if __name__ == "__main__":
    seed()
    print("Database seeded successfully.")
