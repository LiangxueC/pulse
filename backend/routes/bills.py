from fastapi import APIRouter
from services.data_service import get_bills

router = APIRouter()


@router.get("/")
def list_bills():
    bills = get_bills()
    total_due = sum(b["amount"] for b in bills)
    return {"items": bills, "totalDue": total_due}


@router.post("/pay-all")
def pay_all_bills():
    bills = get_bills()
    total = sum(b["amount"] for b in bills)
    return {
        "success": True,
        "paidCount": len(bills),
        "totalPaid": total,
        "message": f"Scheduled payment for {len(bills)} bills totaling ${total:,.2f}.",
        "bills": [{"name": b["name"], "amount": b["amount"]} for b in bills],
    }


@router.post("/pay/{bill_id}")
def pay_single_bill(bill_id: str):
    bills = get_bills()
    bill = next((b for b in bills if b["id"] == bill_id), None)
    if not bill:
        return {"success": False, "message": "Bill not found"}
    return {
        "success": True,
        "message": f"Scheduled payment for {bill['name']}: ${bill['amount']:,.2f} due {bill['dueDateLabel']}.",
    }