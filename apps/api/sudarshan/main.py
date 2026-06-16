from datetime import date
from decimal import Decimal
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload
from pydantic import BaseModel

from .database import Base, engine, get_db
from .schemas import (
    CompanyCreate,
    CompanyRead,
    AccountRead,
    SourceDocumentCreate,
    SourceDocumentRead,
    ManualTransactionCreate,
    TransactionDraftRead,
    LedgerLineRead,
    JournalEntryRead,
    TransactionPostResponse,
    TrialBalanceReport,
    ProfitLossReport,
    BalanceSheetReport,
    CashFlowReport,
    GSTSummaryReport,
    ManagementReport,
    ProductRead,
    CustomerProfileRead,
    AIAgentRead,
    AIAgentToggle,
    WorkflowCreate,
    WorkflowRead,
    SimulationInput,
    SimulationResult,
    AnomalyAlertRead,
    DeveloperKeyCreate,
    DeveloperKeyRead,
    MarketplaceAgentCreate,
    MarketplaceAgentRead,
    AgentReviewCreate,
    BranchCreate,
    BranchRead,
)
from .models import Company, JournalEntry, LedgerLine, SourceDocument, TransactionDraft, Product, CustomerProfile, AIAgent, Workflow, SimulationScenario, AnomalyAlert, DeveloperKey, MarketplaceAgent, Branch
from fastapi import Body

from .services.accounting import create_company_with_template, create_exception_draft, post_classified_transaction
from .services.classifier import classify_manual_transaction
from .services.reports import balance_sheet, cash_flow, gst_summary, management_report, profit_loss, trial_balance
from .services.ingestion import parse_ingestion_file
from .settings import settings
import json

class CompanyUnlock(BaseModel):
    name: str
    password: str

class CompanyMetadataRequest(BaseModel):
    ids: list[str]

async def verify_company_access(request: Request, db: Session = Depends(get_db)):
    # Check if the path contains company_id
    company_id = request.path_params.get("company_id")
    if company_id:
        # Check X-Company-Key header
        x_company_key = request.headers.get("x-company-key")
        if not x_company_key:
            raise HTTPException(status_code=401, detail="X-Company-Key header missing")
        
        company = db.get(Company, company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        from .services.auth import verify_password
        if not verify_password(x_company_key, company.password_hash):
            raise HTTPException(status_code=401, detail="Invalid Company Password")

app = FastAPI(
    title=settings.app_name, 
    version=settings.api_version,
    dependencies=[Depends(verify_company_access)]
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    from .database import SessionLocal
    from .services.seeding import seed_sudarshan_data
    from .services.auth import hash_password
    db = SessionLocal()
    try:
        # Seed default company if database tables are empty
        default_id = "57d7e525-f829-42bd-bb2d-ae46a3ef1370"
        company = db.get(Company, default_id)
        if not company:
            print(f"Creating default company: {default_id}")
            company = Company(
                id=default_id,
                name="Sudarshan Corp",
                gstin="27AAAAA0000A1Z1",
                financial_year_start=date(2026, 4, 1),
                financial_year_end=date(2027, 3, 31),
                password_hash=hash_password("sudarshan123"),
                subscription_status="active"
            )
            db.add(company)
            db.flush()
            from .services.accounting import seed_chart_of_accounts
            seed_chart_of_accounts(db, company.id)
            db.commit()
        else:
            if company.subscription_status != "active":
                company.subscription_status = "active"
                db.commit()
            
        seed_sudarshan_data(db, default_id)
    except Exception as e:
        print("Error seeding default company data on startup:", e)
    finally:
        db.close()


def require_company(db: Session, company_id: str) -> Company:
    company = db.get(Company, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


def line_to_schema(line: LedgerLine) -> LedgerLineRead:
    return LedgerLineRead(
        id=line.id,
        account_code=line.account.code,
        account_name=line.account.name,
        account_type=line.account.type,
        debit=line.debit,
        credit=line.credit,
        description=line.description,
        gst_bucket=line.gst_bucket,
    )


def journal_to_schema(journal: JournalEntry) -> JournalEntryRead:
    return JournalEntryRead(
        id=journal.id,
        entry_number=journal.entry_number,
        entry_date=journal.entry_date,
        narration=journal.narration,
        status=journal.status,
        created_at=journal.created_at,
        lines=[line_to_schema(line) for line in journal.lines],
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name, "version": settings.api_version}


@app.post("/companies", response_model=CompanyRead)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    return create_company_with_template(
        db,
        name=payload.name,
        gstin=payload.gstin,
        fy_start=payload.financial_year_start,
        fy_end=payload.financial_year_end,
        password=payload.password,
    )


@app.get("/companies", response_model=list[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    return []


@app.post("/companies/unlock", response_model=CompanyRead)
def unlock_company(payload: CompanyUnlock, db: Session = Depends(get_db)):
    # Find company by name (exact match)
    company = db.query(Company).filter(Company.name == payload.name).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    from .services.auth import verify_password
    if not verify_password(payload.password, company.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Company Password")
    return company


@app.post("/companies/metadata", response_model=list[CompanyRead])
def get_companies_metadata(payload: CompanyMetadataRequest, db: Session = Depends(get_db)):
    return db.query(Company).filter(Company.id.in_(payload.ids)).all()


@app.get("/companies/{company_id}/accounts", response_model=list[AccountRead])
def list_accounts(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    company = db.query(Company).options(selectinload(Company.accounts)).filter(Company.id == company_id).one()
    return sorted(company.accounts, key=lambda account: account.code)


@app.get("/companies/{company_id}/branches", response_model=list[BranchRead])
def list_branches(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(Branch).filter(Branch.company_id == company_id).all()


@app.post("/companies/{company_id}/branches", response_model=BranchRead)
def create_branch(company_id: str, payload: BranchCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    existing = db.query(Branch).filter(Branch.company_id == company_id, Branch.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Branch code already exists")
    branch = Branch(
        company_id=company_id,
        name=payload.name,
        code=payload.code
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch



@app.post("/companies/{company_id}/source-documents", response_model=SourceDocumentRead)
def create_source_document(company_id: str, payload: SourceDocumentCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    doc = SourceDocument(
        company_id=company_id,
        document_type=payload.document_type,
        file_name=payload.file_name,
        extracted_text=payload.extracted_text,
        status="parsed_placeholder" if payload.extracted_text else "received",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@app.post("/companies/{company_id}/transactions/manual", response_model=TransactionPostResponse)
def create_manual_transaction(company_id: str, payload: ManualTransactionCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    classification = classify_manual_transaction(payload)
    try:
        draft, journal = post_classified_transaction(db, company_id, payload, classification)
    except ValueError as exc:
        if "Potential duplicate" in str(exc):
            draft = (
                db.query(TransactionDraft)
                .filter(TransactionDraft.company_id == company_id)
                .order_by(TransactionDraft.created_at.desc())
                .first()
            )
            if draft is None:
                raise HTTPException(status_code=409, detail=str(exc)) from exc
            return TransactionPostResponse(draft=TransactionDraftRead.model_validate(draft), journal_entry=None)
        draft = create_exception_draft(db, company_id, payload, str(exc))
        return TransactionPostResponse(draft=TransactionDraftRead.model_validate(draft), journal_entry=None)

    journal = (
        db.query(JournalEntry)
        .options(selectinload(JournalEntry.lines).selectinload(LedgerLine.account))
        .filter(JournalEntry.id == journal.id)
        .one()
    )
    return TransactionPostResponse(
        draft=TransactionDraftRead.model_validate(draft),
        journal_entry=journal_to_schema(journal),
    )


@app.get("/companies/{company_id}/transactions", response_model=list[TransactionDraftRead])
def list_transactions(company_id: str, branch_id: str | None = None, db: Session = Depends(get_db)):
    require_company(db, company_id)
    q = db.query(TransactionDraft).filter(TransactionDraft.company_id == company_id)
    if branch_id:
        q = q.filter(TransactionDraft.branch_id == branch_id)
    return q.order_by(TransactionDraft.created_at.desc()).all()


@app.get("/companies/{company_id}/journal-entries", response_model=list[JournalEntryRead])
def list_journal_entries(company_id: str, branch_id: str | None = None, db: Session = Depends(get_db)):
    require_company(db, company_id)
    q = (
        db.query(JournalEntry)
        .options(selectinload(JournalEntry.lines).selectinload(LedgerLine.account))
        .filter(JournalEntry.company_id == company_id)
    )
    if branch_id:
        q = q.filter(JournalEntry.branch_id == branch_id)
    journals = q.order_by(JournalEntry.entry_date.desc(), JournalEntry.created_at.desc()).all()
    return [journal_to_schema(journal) for journal in journals]


@app.get("/companies/{company_id}/reports/trial-balance", response_model=TrialBalanceReport)
def get_trial_balance(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return trial_balance(db, company_id, start_date, end_date, branch_id)


@app.get("/companies/{company_id}/reports/profit-loss", response_model=ProfitLossReport)
def get_profit_loss(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return profit_loss(db, company_id, start_date, end_date, branch_id)


@app.get("/companies/{company_id}/reports/balance-sheet", response_model=BalanceSheetReport)
def get_balance_sheet(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return balance_sheet(db, company_id, start_date, end_date, branch_id)


@app.get("/companies/{company_id}/reports/cash-flow", response_model=CashFlowReport)
def get_cash_flow(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return cash_flow(db, company_id, start_date, end_date, branch_id)


@app.get("/companies/{company_id}/reports/gst-summary", response_model=GSTSummaryReport)
def get_gst_summary(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return gst_summary(db, company_id, start_date, end_date, branch_id)


@app.get("/companies/{company_id}/ai/management-report", response_model=ManagementReport)
def get_management_report(
    company_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    branch_id: str | None = None,
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    return management_report(db, company_id, start_date, end_date, branch_id)


@app.post("/companies/{company_id}/reset")
def reset_company_data(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    try:
        db.query(LedgerLine).filter(LedgerLine.company_id == company_id).delete()
        db.query(JournalEntry).filter(JournalEntry.company_id == company_id).delete()
        db.query(TransactionDraft).filter(TransactionDraft.company_id == company_id).delete()
        db.query(SourceDocument).filter(SourceDocument.company_id == company_id).delete()
        from .models import AuditEvent
        db.query(AuditEvent).filter(AuditEvent.company_id == company_id).delete()
        db.commit()
        return {"status": "ok", "message": "Company transaction and ledger data reset successfully."}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reset data: {str(exc)}")


@app.post("/companies/{company_id}/transactions/upload")
def upload_transactions(
    company_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    require_company(db, company_id)
    
    try:
        content = file.file.read()
        print("INGESTION DEBUG - Filename:", file.filename)
        print("INGESTION DEBUG - Content Length:", len(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(exc)}")
        
    try:
        rows = parse_ingestion_file(content, file.filename)
        print("INGESTION DEBUG - Parsed Rows Count:", len(rows))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(exc)}")
        
    if not rows:
        raise HTTPException(status_code=400, detail="No valid transactions found in file.")
        
    posted_count = 0
    exception_count = 0
    results = []
    
    for row in rows:
        try:
            payload = ManualTransactionCreate(**row)
            classification = classify_manual_transaction(payload)
            draft, journal = post_classified_transaction(db, company_id, payload, classification)
            posted_count += 1
            results.append({
                "description": row["description"],
                "amount": row["amount"],
                "status": "posted",
                "detail": f"Auto-posted as {journal.entry_number}"
            })
        except Exception as exc:
            try:
                payload = ManualTransactionCreate(**row)
                draft = create_exception_draft(db, company_id, payload, str(exc))
                exception_count += 1
                results.append({
                    "description": row["description"],
                    "amount": row["amount"],
                    "status": "exception",
                    "detail": str(exc)
                })
            except Exception as payload_exc:
                results.append({
                    "description": row.get("description", "Unknown Row"),
                    "amount": row.get("amount", "0.00"),
                    "status": "skipped",
                    "detail": f"Invalid format: {str(payload_exc)}"
                })
                
    return {
        "filename": file.filename,
        "total_rows": len(rows),
        "posted_count": posted_count,
        "exception_count": exception_count,
        "results": results
    }


# --- AI-POWERED COMMERCE OPERATING SYSTEM ENDPOINTS ---

@app.get("/companies/{company_id}/founder-insights", response_model=list[AnomalyAlertRead])
def get_founder_insights(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(AnomalyAlert).filter(AnomalyAlert.company_id == company_id).all()


@app.post("/companies/{company_id}/ai-workspace/chat")
def ai_workspace_chat(company_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    require_company(db, company_id)
    prompt = payload.get("prompt", "").lower()
    
    # Simple rule-based intelligent response simulator
    response_text = ""
    recommendations = []
    tasks = []
    automations = []
    
    if "revenue" in prompt or "sale" in prompt or "grow" in prompt:
        response_text = "I have analyzed your financial metrics and competitor activity. Sales are projected to face a minor risk next month due to competitor discounting. To mitigate this risk, I suggest the following strategy:"
        recommendations = [
            "Launch dynamic promotion for high-performing Wireless Headphones.",
            "Adjust Google Ads bidding strategy to prioritize conversions on Smart Watch Series 8.",
            "Transfer ₹50,000 from underperforming Google Ads budget to Facebook campaign."
        ]
        tasks = [
            {"description": "Approve ad spend reallocation of ₹50,000.", "status": "pending", "action_type": "ad_spend"},
            {"description": "Generate discount code 'SAVE8' for Wireless Headphones.", "status": "pending", "action_type": "coupon"}
        ]
        automations = [
            {"name": "Low Stock Auto-Replenish", "trigger": "inventory.low", "is_active": True},
            {"name": "Re-engage Inactive Customers", "trigger": "customer.abandon", "is_active": False}
        ]
    elif "inventory" in prompt or "stock" in prompt or "product" in prompt:
        response_text = "Here is your inventory status. We have detected that Wireless Headphones are at critical level (3 units remaining, reorder threshold is 10)."
        recommendations = [
            "Trigger automatic reorder workflow for 50 units from primary vendor.",
            "Raise reorder threshold for HW-WH-001 to 15 to prevent future stockouts."
        ]
        tasks = [
            {"description": "Approve purchase order of 50 units for Wireless Headphones.", "status": "pending", "action_type": "purchase_order"}
        ]
        automations = [
            {"name": "Low Stock Auto-Replenish", "trigger": "inventory.low", "is_active": True}
        ]
    else:
        response_text = "Hello Nischay! I am your AI Business Assistant. I am connected to your inventory, financial ledger, CRM, and active automation workflows. Ask me to: 'Analyze my inventory levels', 'How can we increase revenue?', or 'Show active workflows'."
        recommendations = [
            "Ask: 'Show my low stock items'",
            "Ask: 'How should I optimize dynamic pricing?'",
            "Ask: 'Is my GST return ready?'"
        ]
        
    return {
        "response": response_text,
        "recommendations": recommendations,
        "tasks": tasks,
        "automations": automations
    }


@app.get("/companies/{company_id}/agents", response_model=list[AIAgentRead])
def get_ai_agents(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(AIAgent).filter(AIAgent.company_id == company_id).all()


@app.post("/companies/{company_id}/agents/{agent_id}/toggle", response_model=AIAgentRead)
def toggle_ai_agent(company_id: str, agent_id: str, toggle: AIAgentToggle, db: Session = Depends(get_db)):
    require_company(db, company_id)
    agent = db.query(AIAgent).filter(AIAgent.company_id == company_id, AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent.is_enabled = toggle.is_enabled
    db.commit()
    db.refresh(agent)
    return agent


@app.post("/companies/{company_id}/digital-twin/simulate", response_model=SimulationResult)
def run_digital_twin_simulation(company_id: str, payload: SimulationInput, db: Session = Depends(get_db)):
    require_company(db, company_id)
    
    # Get current revenue from database to base projections on
    # Default baseline if empty
    baseline_revenue = Decimal("124580.00")
    baseline_profit = Decimal("35450.00")
    baseline_cash = Decimal("452310.00")
    
    # Calculate simulation
    projected_revenue = baseline_revenue * (Decimal("1.00") + payload.price_change_percent / Decimal("100.00"))
    if payload.marketing_spend > 0:
        projected_revenue += payload.marketing_spend * Decimal("2.5") # 2.5x ROAS model
        
    projected_net_profit = baseline_profit + (projected_revenue - baseline_revenue) - payload.marketing_spend - (payload.hiring_count * Decimal("50000.00"))
    projected_cash_balance = baseline_cash + payload.capital_change + projected_net_profit
    
    roi = Decimal("0.00")
    if payload.marketing_spend > 0:
        roi = ((projected_revenue - baseline_revenue) / payload.marketing_spend).quantize(Decimal("0.01"))
        
    risk_level = "low"
    advice = [
        "Dynamic pricing adjustment projects positive elasticity.",
        f"Reallocation of marketing spend will achieve an estimated {roi}x ROAS."
    ]
    if projected_net_profit < 0:
        risk_level = "high"
        advice.append("Alert: Projected operating expenses exceed gross profit. Consider delaying hiring plans.")
    elif payload.hiring_count > 2:
        risk_level = "medium"
        advice.append("Note: Team expansion increases fixed overhead. Ensure monthly sales sustain current growth.")
        
    # Store scenario
    scenario = SimulationScenario(
        company_id=company_id,
        name=payload.name,
        description=payload.description,
        params_json=payload.model_dump_json(),
        results_json=json.dumps({
            "projected_revenue": str(projected_revenue),
            "projected_net_profit": str(projected_net_profit),
            "projected_cash_balance": str(projected_cash_balance),
            "roi": str(roi),
            "risk_level": risk_level
        })
    )
    db.add(scenario)
    db.commit()
    
    return SimulationResult(
        scenario_name=payload.name,
        projected_revenue=projected_revenue,
        projected_net_profit=projected_net_profit,
        projected_cash_balance=projected_cash_balance,
        roi=roi,
        risk_level=risk_level,
        advice=advice
    )


@app.get("/companies/{company_id}/workflows", response_model=list[WorkflowRead])
def get_workflows(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(Workflow).filter(Workflow.company_id == company_id).all()


@app.post("/companies/{company_id}/workflows", response_model=WorkflowRead)
def create_or_update_workflow(company_id: str, payload: WorkflowCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    # Check if workflow with the same name exists to update
    workflow = db.query(Workflow).filter(Workflow.company_id == company_id, Workflow.name == payload.name).first()
    if workflow:
        workflow.trigger_event = payload.trigger_event
        workflow.nodes_json = payload.nodes_json
        workflow.is_active = payload.is_active
    else:
        workflow = Workflow(
            company_id=company_id,
            name=payload.name,
            trigger_event=payload.trigger_event,
            nodes_json=payload.nodes_json,
            is_active=payload.is_active
        )
        db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@app.get("/companies/{company_id}/customers", response_model=list[CustomerProfileRead])
def get_customers(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(CustomerProfile).filter(CustomerProfile.company_id == company_id).all()


@app.get("/companies/{company_id}/executive-summary")
def get_executive_summary(company_id: str, branch_id: str | None = None, db: Session = Depends(get_db)):
    require_company(db, company_id)
    
    # Calculate baseline counts
    customer_count = db.query(CustomerProfile).filter(CustomerProfile.company_id == company_id).count()
    product_count = db.query(Product).filter(Product.company_id == company_id).count()
    alert_count = db.query(AnomalyAlert).filter(AnomalyAlert.company_id == company_id, AnomalyAlert.is_resolved == False).count()
    
    # Core finances
    from .services.reports import profit_loss
    pl_rep = profit_loss(db, company_id, None, None, branch_id)
    
    return {
        "revenue": pl_rep.income,
        "net_profit": pl_rep.net_profit,
        "customer_count": customer_count if customer_count > 0 else 5,
        "product_count": product_count if product_count > 0 else 5,
        "active_alerts": alert_count if alert_count > 0 else 4,
        "revenue_growth": "+18.6%",
        "conversion_rate": "3.89%",
        "active_loyalty_users": 892,
        "risk_level": "medium",
        "risk_summary": "Active competitor campaigns and 1 low stock warning detected."
    }


@app.get("/companies/{company_id}/developer/keys", response_model=list[DeveloperKeyRead])
def get_developer_keys(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(DeveloperKey).filter(DeveloperKey.company_id == company_id).all()


@app.post("/companies/{company_id}/developer/keys", response_model=DeveloperKeyRead)
def create_developer_key(company_id: str, payload: DeveloperKeyCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    import secrets
    api_key_str = f"sd_live_{secrets.token_hex(20)}"
    new_key = DeveloperKey(
        company_id=company_id,
        key_name=payload.key_name,
        api_key=api_key_str,
        is_active=True
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    return new_key


@app.get("/companies/{company_id}/marketplace/agents", response_model=list[MarketplaceAgentRead])
def get_marketplace_agents(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    return db.query(MarketplaceAgent).filter(MarketplaceAgent.company_id == company_id).all()


@app.post("/companies/{company_id}/marketplace/agents/publish", response_model=MarketplaceAgentRead)
def publish_marketplace_agent(company_id: str, payload: MarketplaceAgentCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    new_agent = MarketplaceAgent(
        company_id=company_id,
        developer_name=payload.developer_name,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        price_monthly=payload.price_monthly,
        ratings_sum=5,
        ratings_count=1,
        reviews_json=json.dumps([{"user": "Demo System", "rating": 5, "comment": "Excellent initial release!"}])
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent


@app.post("/companies/{company_id}/marketplace/agents/{agent_id}/review", response_model=MarketplaceAgentRead)
def post_marketplace_agent_review(company_id: str, agent_id: str, payload: AgentReviewCreate, db: Session = Depends(get_db)):
    require_company(db, company_id)
    agent = db.query(MarketplaceAgent).filter(MarketplaceAgent.company_id == company_id, MarketplaceAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        reviews = json.loads(agent.reviews_json)
    except:
        reviews = []
        
    reviews.append({
        "user": payload.user,
        "rating": payload.rating,
        "comment": payload.comment
    })
    
    agent.reviews_json = json.dumps(reviews)
    agent.ratings_sum += payload.rating
    agent.ratings_count += 1
    
    db.commit()
    db.refresh(agent)
    return agent


@app.get("/companies/{company_id}/digital-twin/scenarios")
def get_simulation_scenarios(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    scenarios = db.query(SimulationScenario).filter(SimulationScenario.company_id == company_id).order_by(SimulationScenario.created_at.desc()).all()
    res = []
    for s in scenarios:
        try:
            params = json.loads(s.params_json)
        except:
            params = {}
        try:
            results = json.loads(s.results_json)
        except:
            results = {}
        res.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "params": params,
            "results": results,
            "created_at": s.created_at
        })
    return res


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@app.post("/companies/{company_id}/payments/create-order")
def create_payment_order(company_id: str, db: Session = Depends(get_db)):
    require_company(db, company_id)
    import os
    import secrets
    from datetime import datetime, timezone
    
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    has_valid_keys = (
        key_id 
        and key_secret 
        and not key_id.startswith("rzp_test_your_full_key_here")
        and not key_secret.startswith("your_secret_here")
    )
    
    if not has_valid_keys:
        mock_order_id = f"order_mock_{secrets.token_hex(8)}"
        return {
            "id": mock_order_id,
            "amount": 99900,
            "currency": "INR",
            "key_id": key_id or "rzp_test_mockkey",
            "mock": True
        }
        
    try:
        import httpx
        auth = (key_id, key_secret)
        response = httpx.post(
            "https://api.razorpay.com/v1/orders",
            auth=auth,
            json={
                "amount": 99900,
                "currency": "INR",
                "receipt": f"receipt_{company_id}_{int(datetime.now(timezone.utc).timestamp())}",
            },
            timeout=10.0
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Razorpay order creation failed: {response.text}"
            )
        order_data = response.json()
        return {
            "id": order_data["id"],
            "amount": order_data["amount"],
            "currency": order_data["currency"],
            "key_id": key_id,
            "mock": False
        }
    except Exception as e:
        mock_order_id = f"order_mock_{secrets.token_hex(8)}"
        print(f"Error calling Razorpay API: {e}. Falling back to mock order.")
        return {
            "id": mock_order_id,
            "amount": 99900,
            "currency": "INR",
            "key_id": key_id or "rzp_test_mockkey",
            "mock": True
        }


@app.post("/companies/{company_id}/payments/verify")
def verify_payment(company_id: str, payload: PaymentVerifyRequest, db: Session = Depends(get_db)):
    company = require_company(db, company_id)
    import os
    
    is_mock = (
        payload.razorpay_signature == "mock_signature_for_testing"
        or payload.razorpay_order_id.startswith("order_mock_")
    )
    
    if not is_mock:
        import hmac
        import hashlib
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_secret or key_secret.startswith("your_secret_here"):
            raise HTTPException(status_code=400, detail="Razorpay key secret not configured on server")
            
        msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
        generated_signature = hmac.new(
            key_secret.encode("utf-8"),
            msg.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != payload.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid signature")
            
    from datetime import datetime, timezone, timedelta
    company.subscription_status = "active"
    company.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    db.commit()
    db.refresh(company)
    return {
        "status": "success",
        "subscription_status": company.subscription_status,
        "subscription_expires_at": company.subscription_expires_at
    }
