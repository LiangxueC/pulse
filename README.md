# Pulse — Cash Flow Assistant (ProductSC · Intuit)

A demo product for QuickBooks that helps small business owners understand their cash flow, identify financial risks, and take guided actions to improve their cash position.

---

## What it does

Pulse monitors a business's 30-day cash flow projection, surfaces the root causes of cash shortfalls, and walks the owner through a structured action workflow to address them. An AI chat assistant (powered by Google Gemini) is available throughout for questions.

**Core workflow:**

1. **Dashboard** — Traffic-light health status, projected lowest balance, outstanding invoices, upcoming bills
2. **Detail view** — 30-day balance chart, reasons for cash risk (overdue invoices, underused subscriptions, payroll vs. revenue)
3. **Next steps** — Ranked, actionable suggestions across three categories: subscriptions, payroll, invoices
4. **Action wizard** — User chooses to let Pulse execute actions or handle them manually; sees projected cash improvement
5. **Case archive** — Every completed workflow is saved as a searchable case

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Chart.js |
| Backend | FastAPI (Python 3.12), Uvicorn |
| Database | SQLite via SQLAlchemy 2.0 |
| AI | Google Gemini 2.5 Flash Lite |

---

## Project structure

```
.
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── db.py                    # SQLAlchemy engine and session
│   ├── models.py                # ORM models (9 tables)
│   ├── seed.py                  # Seeds DB from mockData.json on first run
│   ├── requirements.txt
│   ├── data/
│   │   ├── pulse.db             # SQLite database (auto-created)
│   │   └── mockData.json        # Source data for seeding
│   ├── routes/
│   │   ├── dashboard.py         # GET /api/dashboard
│   │   ├── cashflow.py          # GET /api/cashflow/detail, /projection
│   │   ├── invoices.py          # GET/POST /api/invoices
│   │   ├── bills.py             # GET/POST /api/bills
│   │   ├── cases.py             # CRUD /api/cases
│   │   ├── chat.py              # POST /api/chat
│   │   └── actions.py           # GET/POST /api/actions
│   └── services/
│       ├── data_service.py      # DB query helpers + business logic
│       ├── llm_service.py       # Gemini API calls
│       └── projection_service.py# 30-day balance projection engine
└── frontend/
    └── src/
        ├── App.tsx              # Root component, screen router, global state
        ├── api.ts               # All fetch calls to backend
        ├── screens/             # 14 full-page views
        └── components/          # Sidebar, NavBars, CashFlowChart, ChatDrawer, etc.
```

---

## Database schema

| Table | Description |
|---|---|
| `companies` | Company name, user name |
| `cash_flow_config` | Projected balance, target buffer, safe zone threshold |
| `cash_flow_projection` | Day-by-day balance series (31 rows per company) |
| `invoices` | Outstanding invoices with days overdue and amount |
| `bills` | Upcoming bills with due dates and amounts |
| `subscription_ranking` | SaaS subscriptions flagged recommended or not |
| `cash_redirects` | Alternative uses for freed-up cash |
| `redirect_impacts` | Projected balance impact for each redirect option |
| `archived_cases` | Completed workflow sessions with date and label |

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard` | Summary: status, invoices, bills |
| GET | `/api/cashflow/detail` | Full analysis with reasons and steps |
| GET | `/api/cashflow/projection` | 30-day balance projection |
| GET | `/api/cashflow/steps/{id}/explain` | AI explanation of a suggested step |
| GET | `/api/invoices` | List outstanding invoices |
| POST | `/api/invoices/remind-all` | Send reminders to all overdue companies |
| POST | `/api/invoices/remind/{id}` | Send reminder for one invoice |
| GET | `/api/bills` | List upcoming bills |
| POST | `/api/bills/pay-all` | Schedule all bill payments |
| POST | `/api/bills/pay/{id}` | Schedule one bill payment |
| GET | `/api/cases` | List archived cases (supports `?search=`) |
| POST | `/api/cases` | Create a case |
| DELETE | `/api/cases/{id}` | Delete one case |
| DELETE | `/api/cases/bulk` | Delete multiple cases |
| GET | `/api/actions/subscriptions` | Subscription ranking |
| GET | `/api/actions/cash-redirects` | Cash redirect options |
| GET | `/api/actions/redirect-impact/{id}` | Projected impact of a redirect |
| POST | `/api/actions/execute` | Execute an action (subscriptions/payroll/invoices) |
| POST | `/api/actions/close` | Archive current workflow as a case |
| GET | `/api/actions/payroll-summary` | AI-generated payroll analysis |
| POST | `/api/chat` | Chat with Pulse AI assistant |

---

## Getting started

### Prerequisites

- Python 3.12
- Node.js 18+

### Backend

```bash
cd backend

# Create and activate virtual environment
python3.12 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Gemini API key
echo "GOOGLE_API_KEY=your_key_here" > .env

# Start the server (DB is created and seeded automatically on first run)
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key for AI features |

---

## Notes

- The SQLite database is created at `backend/data/pulse.db` on first startup and seeded from `backend/data/mockData.json`. Delete `pulse.db` to re-seed from scratch.
- All data is mock/demo data. No real QuickBooks or financial data is used.
- The cash flow projection is computed dynamically from bills and invoice data in the DB, not stored as a static series.
