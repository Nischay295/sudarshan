from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import AccountType, DraftStatus, JournalStatus, NormalBalance


FlowType = Literal[
    "sale",
    "purchase",
    "expense",
    "income",
    "receipt",
    "payment",
    "owner_contribution",
    "loan_received",
]
GSTTreatment = Literal["none", "exempt", "intra_state", "inter_state"]


class CompanyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    gstin: str | None = Field(default=None, min_length=15, max_length=15)
    financial_year_start: date
    financial_year_end: date
    password: str = Field(min_length=4, max_length=100)

    @field_validator("financial_year_end")
    @classmethod
    def end_after_start(cls, value: date, info):
        start = info.data.get("financial_year_start")
        if start and value <= start:
            raise ValueError("financial_year_end must be after financial_year_start")
        return value


class CompanyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    gstin: str | None
    financial_year_start: date
    financial_year_end: date
    subscription_status: str
    subscription_expires_at: datetime | None
    created_at: datetime


class BranchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    code: str = Field(min_length=1, max_length=50)


class BranchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    code: str
    created_at: datetime


class AccountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    type: AccountType
    normal_balance: NormalBalance
    is_system: bool


class SourceDocumentCreate(BaseModel):
    document_type: str = Field(default="manual", max_length=50)
    file_name: str | None = Field(default=None, max_length=255)
    extracted_text: str | None = None


class SourceDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_type: str
    file_name: str | None
    extracted_text: str | None
    status: str
    created_at: datetime


class ManualTransactionCreate(BaseModel):
    entry_date: date
    description: str = Field(min_length=3, max_length=500)
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    flow: FlowType
    counterparty: str | None = Field(default=None, max_length=200)
    gst_rate: Decimal = Field(default=Decimal("0.00"), ge=0, le=28, max_digits=5, decimal_places=2)
    gst_treatment: GSTTreatment = "none"
    payment_account_code: str = Field(default="1010", max_length=20)
    source_document_id: str | None = None
    branch_id: str | None = None


class TransactionDraftRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    entry_date: date
    description: str
    amount: Decimal
    flow: str
    counterparty: str | None
    gst_rate: Decimal
    gst_treatment: str
    confidence_score: Decimal
    status: DraftStatus
    classification_reason: str | None
    exception_reason: str | None
    branch_id: str | None
    created_at: datetime


class LedgerLineRead(BaseModel):
    id: str
    account_code: str
    account_name: str
    account_type: AccountType
    debit: Decimal
    credit: Decimal
    description: str
    gst_bucket: str | None


class JournalEntryRead(BaseModel):
    id: str
    entry_number: str
    entry_date: date
    narration: str
    status: JournalStatus
    branch_id: str | None
    created_at: datetime
    lines: list[LedgerLineRead]


class TransactionPostResponse(BaseModel):
    draft: TransactionDraftRead
    journal_entry: JournalEntryRead | None


class TrialBalanceRow(BaseModel):
    account_code: str
    account_name: str
    account_type: AccountType
    debit_total: Decimal
    credit_total: Decimal
    closing_debit: Decimal
    closing_credit: Decimal


class TrialBalanceReport(BaseModel):
    rows: list[TrialBalanceRow]
    total_debit: Decimal
    total_credit: Decimal
    is_balanced: bool


class ProfitLossReport(BaseModel):
    income: Decimal
    expenses: Decimal
    net_profit: Decimal


class BalanceSheetReport(BaseModel):
    assets: Decimal
    liabilities: Decimal
    equity: Decimal
    current_period_profit: Decimal
    balanced: bool


class CashFlowReport(BaseModel):
    opening_cash_placeholder: Decimal
    net_cash_movement: Decimal
    closing_cash: Decimal


class GSTSummaryReport(BaseModel):
    input_gst: Decimal
    output_gst: Decimal
    net_payable: Decimal
    buckets: dict[str, Decimal]


class ManagementReport(BaseModel):
    title: str
    accountant_explanation: str
    management_summary: str
    anomaly_notes: list[str]
    business_advice: list[str]
    investment_goal_commentary: str
    advisory_disclaimer: str


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    sku: str
    price: Decimal
    stock_quantity: int
    reorder_point: int


class CustomerProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str | None
    purchase_count: int
    total_spent: Decimal
    churn_probability: Decimal
    risk_score: Decimal
    behavior_segment: str


class AIAgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: str
    description: str
    is_enabled: bool
    icon_name: str


class AIAgentToggle(BaseModel):
    is_enabled: bool


class WorkflowCreate(BaseModel):
    name: str
    trigger_event: str
    nodes_json: str
    is_active: bool = True


class WorkflowRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    trigger_event: str
    nodes_json: str
    is_active: bool
    created_at: datetime


class SimulationInput(BaseModel):
    name: str
    description: str | None = None
    capital_change: Decimal = Decimal("0.00")
    price_change_percent: Decimal = Decimal("0.00")
    marketing_spend: Decimal = Decimal("0.00")
    hiring_count: int = 0


class SimulationResult(BaseModel):
    scenario_name: str
    projected_revenue: Decimal
    projected_net_profit: Decimal
    projected_cash_balance: Decimal
    roi: Decimal
    risk_level: str
    advice: list[str]


class AnomalyAlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    title: str
    description: str
    severity: str
    is_resolved: bool
    created_at: datetime


class DeveloperKeyCreate(BaseModel):
    key_name: str


class DeveloperKeyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    key_name: str
    api_key: str
    is_active: bool
    created_at: datetime


class MarketplaceAgentCreate(BaseModel):
    developer_name: str
    name: str
    description: str
    category: str
    price_monthly: Decimal


class MarketplaceAgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    developer_name: str
    name: str
    description: str
    category: str
    price_monthly: Decimal
    ratings_sum: int
    ratings_count: int
    reviews_json: str
    created_at: datetime


class AgentReviewCreate(BaseModel):
    user: str
    rating: int = Field(ge=1, le=5)
    comment: str




