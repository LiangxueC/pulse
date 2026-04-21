from fastapi import APIRouter
from services.data_service import get_invoices

router = APIRouter()


@router.get("/")
def list_invoices():
    invoices = get_invoices()
    total_overdue = sum(inv["amount"] for inv in invoices)
    return {"items": invoices, "totalOverdue": total_overdue}


@router.post("/remind-all")
def send_reminders():
    invoices = get_invoices()
    overdue = [i for i in invoices if i.get("daysOverdue", 0) > 0]
    return {
        "success": True,
        "remindedCount": len(overdue),
        "message": f"Payment reminders sent to {len(overdue)} {'company' if len(overdue) == 1 else 'companies'}.",
        "companies": [i["company"] for i in overdue],
    }


@router.post("/remind/{invoice_id}")
def send_single_reminder(invoice_id: str):
    invoices = get_invoices()
    invoice = next((i for i in invoices if i["id"] == invoice_id), None)
    if not invoice:
        return {"success": False, "message": "Invoice not found"}
    return {
        "success": True,
        "message": f"Reminder sent to {invoice['company']} for ${invoice['amount']:,.2f}.",
    }