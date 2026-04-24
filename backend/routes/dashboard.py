from fastapi import APIRouter, Query
from services.data_service import (
    get_company,
    get_cash_flow,
    get_invoices,
    get_bills,
)

router = APIRouter()


@router.get("/")
def get_dashboard(completed: list[str] = Query(default=[])):
    cf = get_cash_flow(completed)
    invoices = get_invoices()
    bills = get_bills()
    total_overdue = sum(inv["amount"] for inv in invoices)
    total_due = sum(b["amount"] for b in bills)
    return {
        "company": get_company(),
        "cashFlow": {
            "projectedLowestBalance": cf["projectedLowestBalance"],
            "status": cf["status"],
            "statusLabel": cf["statusLabel"],
            "issueCount": cf["issueCount"],
        },
        "outstandingInvoices": {"items": invoices, "totalOverdue": total_overdue},
        "upcomingBills": {"items": bills, "totalDue": total_due},
    }