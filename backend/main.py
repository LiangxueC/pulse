from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import dashboard, cashflow, invoices, bills, cases, chat, actions

app = FastAPI(title="Pulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong", "detail": str(exc)},
    )

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(cashflow.router,  prefix="/api/cashflow",  tags=["Cash Flow"])
app.include_router(invoices.router,  prefix="/api/invoices",  tags=["Invoices"])
app.include_router(bills.router,     prefix="/api/bills",     tags=["Bills"])
app.include_router(cases.router,     prefix="/api/cases",     tags=["Archived Cases"])
app.include_router(chat.router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(actions.router,   prefix="/api/actions",   tags=["Actions"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Pulse API is running"}