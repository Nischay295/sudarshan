from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, SessionLocal
from app.routes import accounts, journal_entries, transactions, reports, audit
from app.services.accounting_service import seed_accounts

app = FastAPI(
    title="Sudarshan",
    description="AI-Driven Commerce Intelligence System — Accounting, Finance, Economics, Business & Research",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(journal_entries.router)
app.include_router(transactions.router)
app.include_router(reports.router)
app.include_router(audit.router)


@app.on_event("startup")
def startup():
    init_db()
    db = SessionLocal()
    try:
        seed_accounts(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "system": "Sudarshan", "version": "1.0.0"}
