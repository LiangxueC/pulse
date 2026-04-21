from fastapi import APIRouter
from services.data_service import (
    get_company,
    get_cash_flow,
    get_invoices,
    get_bills,
)

router = APIRouter()


@router.get("/")
def get_dashboard():
    """
    Returns everything needed for the main dashboard.
    Status, issueCount and reasons are all computed from real data.
    """
    cf = get_cash_flow()
    invoices = get_invoices()
    bills = get_bills()

    total_overdue = sum(inv["amount"] for inv in invoices)
    total_due = sum(b["amount"] for b in bills)

    return {
        "company": get_company(),
        "cashFlow": {
            "projectedLowestBalance": cf["projectedLowestBalance"],
            "status": cf["status"],                 # computed
            "statusLabel": cf["statusLabel"],       # computed
            "issueCount": cf["issueCount"],         # computed
        },
        "outstandingInvoices": {
            "items": invoices,
            "totalOverdue": total_overdue,          # computed
        },
        "upcomingBills": {
            "items": bills,
            "totalDue": total_due,                  # computed
        },
    }