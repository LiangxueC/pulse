from datetime import date, timedelta
from services.data_service import get_invoices, get_bills, get_raw_cash_flow


def compute_projection(days: int = 14) -> list[dict]:
    """
    Compute day-by-day projected cash balance using:
    - Starting balance from cash flow data
    - Upcoming bills deducted on their due dates
    - Overdue invoices expected to be collected
      (60% collected on expected day based on how late they are)
    """
    # ── Guard: ensure days is a positive integer ──
    if not isinstance(days, int) or days <= 0:
        days = 14

    cf = get_raw_cash_flow()
    starting_balance = cf.get("projectedLowestBalance", 0)
    today = date.today()

    # Build a daily delta map: day_index -> amount change
    deltas: dict[int, float] = {i: 0.0 for i in range(days + 1)}

    # ── Deduct upcoming bills on their due dates ──
    bills = get_bills()
    for bill in bills:
        try:
            due = date.fromisoformat(bill["dueDate"])
            delta_days = (due - today).days
            if 0 <= delta_days <= days:
                deltas[delta_days] -= float(bill.get("amount", 0))
        except (ValueError, KeyError, TypeError):
            # Skip bills with invalid or missing date
            continue

    # ── Add expected invoice collections ──
    invoices = get_invoices()
    overdue = [i for i in invoices if i.get("daysOverdue", 0) > 0]

    for inv in overdue:
        try:
            amount = float(inv.get("amount", 0))
            days_late = int(inv.get("daysOverdue", 0))
        except (ValueError, TypeError):
            continue

        if amount <= 0:
            continue

        # Heuristic: the longer overdue, the later we expect collection
        if days_late <= 3:
            expected_day = 3
        elif days_late <= 7:
            expected_day = 7
        else:
            expected_day = 14

        # Clamp to our projection window
        expected_day = min(expected_day, days)

        # Collect 60% on expected day — 40% remains uncertain
        deltas[expected_day] += amount * 0.6

    # ── Build cumulative balance curve ──
    result = []
    running = float(starting_balance)

    for day in range(days + 1):
        running += deltas[day]
        result.append({"day": day, "balance": round(running, 2)})

    return result