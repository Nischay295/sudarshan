from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=200)
    account_type: str
    parent_id: Optional[int] = None
    description: Optional[str] = None


class AccountResponse(BaseModel):
    id: int
    code: str
    name: str
    account_type: str
    parent_id: Optional[int]
    description: Optional[str]
    is_active: bool
    balance: float
    created_at: datetime

    model_config = {"from_attributes": True}


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class JournalLineCreate(BaseModel):
    account_id: int
    debit: float = 0.0
    credit: float = 0.0
    description: Optional[str] = None


class JournalEntryCreate(BaseModel):
    date: datetime
    description: str
    reference: Optional[str] = None
    lines: list[JournalLineCreate]


class JournalLineResponse(BaseModel):
    id: int
    account_id: int
    account_name: Optional[str] = None
    account_code: Optional[str] = None
    debit: float
    credit: float
    description: Optional[str]

    model_config = {"from_attributes": True}


class JournalEntryResponse(BaseModel):
    id: int
    entry_number: str
    date: datetime
    description: str
    reference: Optional[str]
    status: str
    total_debit: float
    total_credit: float
    created_by: str
    approved_by: Optional[str]
    created_at: datetime
    posted_at: Optional[datetime]
    lines: list[JournalLineResponse] = []

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    date: datetime
    description: str
    amount: float
    transaction_type: str
    category: Optional[str] = None
    counterparty: Optional[str] = None
    tax_category: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    date: datetime
    description: str
    amount: float
    transaction_type: str
    category: Optional[str]
    counterparty: Optional[str]
    ai_classification: Optional[str]
    ai_confidence: Optional[float]
    status: str
    journal_entry_id: Optional[int]
    tax_category: Optional[str]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionApproval(BaseModel):
    approved: bool
    category_override: Optional[str] = None
    notes: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: int
    user: str
    details: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class TrialBalanceItem(BaseModel):
    account_id: int
    account_code: str
    account_name: str
    account_type: str
    debit: float
    credit: float


class TrialBalanceResponse(BaseModel):
    as_of_date: datetime
    items: list[TrialBalanceItem]
    total_debit: float
    total_credit: float
    is_balanced: bool


class FinancialStatementLine(BaseModel):
    account_code: str
    account_name: str
    amount: float


class FinancialStatementSection(BaseModel):
    title: str
    lines: list[FinancialStatementLine]
    total: float


class IncomeStatementResponse(BaseModel):
    period_start: datetime
    period_end: datetime
    revenue: FinancialStatementSection
    expenses: FinancialStatementSection
    net_income: float


class BalanceSheetResponse(BaseModel):
    as_of_date: datetime
    assets: FinancialStatementSection
    liabilities: FinancialStatementSection
    equity: FinancialStatementSection
    total_assets: float
    total_liabilities_equity: float
    is_balanced: bool


class CashFlowItem(BaseModel):
    description: str
    amount: float


class CashFlowSection(BaseModel):
    title: str
    items: list[CashFlowItem]
    total: float


class CashFlowResponse(BaseModel):
    period_start: datetime
    period_end: datetime
    operating: CashFlowSection
    investing: CashFlowSection
    financing: CashFlowSection
    net_change: float
    opening_balance: float
    closing_balance: float


class DashboardKPI(BaseModel):
    label: str
    value: float
    change_percent: Optional[float] = None
    trend: Optional[str] = None


class DashboardResponse(BaseModel):
    total_revenue: float
    total_expenses: float
    net_income: float
    total_assets: float
    total_liabilities: float
    total_equity: float
    cash_balance: float
    accounts_receivable: float
    accounts_payable: float
    pending_transactions: int
    recent_transactions: list[TransactionResponse]
    kpis: list[DashboardKPI]


class RatioAnalysis(BaseModel):
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    gross_margin: Optional[float] = None
    net_margin: Optional[float] = None
    return_on_assets: Optional[float] = None
    return_on_equity: Optional[float] = None
    asset_turnover: Optional[float] = None
    working_capital: Optional[float] = None
