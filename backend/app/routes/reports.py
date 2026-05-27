from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    TrialBalanceResponse, IncomeStatementResponse,
    BalanceSheetResponse, CashFlowResponse,
    DashboardResponse, RatioAnalysis,
)
from app.services.accounting_service import (
    get_trial_balance, get_income_statement,
    get_balance_sheet, get_cash_flow,
    get_dashboard, get_ratio_analysis,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/trial-balance", response_model=TrialBalanceResponse)
def trial_balance(db: Session = Depends(get_db)):
    return get_trial_balance(db)


@router.get("/income-statement", response_model=IncomeStatementResponse)
def income_statement(
    start_date: str = Query(default="2024-01-01"),
    end_date: str = Query(default="2025-12-31"),
    db: Session = Depends(get_db),
):
    start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
    return get_income_statement(db, start, end)


@router.get("/balance-sheet", response_model=BalanceSheetResponse)
def balance_sheet(db: Session = Depends(get_db)):
    return get_balance_sheet(db)


@router.get("/cash-flow", response_model=CashFlowResponse)
def cash_flow(
    start_date: str = Query(default="2024-01-01"),
    end_date: str = Query(default="2025-12-31"),
    db: Session = Depends(get_db),
):
    start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
    return get_cash_flow(db, start, end)


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard(db)


@router.get("/ratios", response_model=RatioAnalysis)
def ratios(db: Session = Depends(get_db)):
    return get_ratio_analysis(db)
