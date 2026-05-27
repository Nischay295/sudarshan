"""Core Accounting Engine for Sudarshan.

Deterministic double-entry accounting system.
AI suggests, system validates, human approves, ledger stores final truth.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.accounting import (
    Account, AccountType, JournalEntry, JournalLine,
    Transaction, TransactionStatus,
)
from app.models.schemas import (
    AccountCreate, JournalEntryCreate, TransactionCreate,
    TrialBalanceItem, TrialBalanceResponse,
    IncomeStatementResponse, BalanceSheetResponse, CashFlowResponse,
    FinancialStatementSection, FinancialStatementLine,
    CashFlowSection, CashFlowItem,
    DashboardResponse, DashboardKPI, TransactionResponse,
    RatioAnalysis,
)
from app.services.classification_service import classify_transaction
from app.services.audit_service import log_action


DEFAULT_CHART_OF_ACCOUNTS = [
    ("1100", "Cash & Bank", AccountType.ASSET),
    ("1200", "Inventory", AccountType.ASSET),
    ("1210", "Accounts Receivable", AccountType.ASSET),
    ("1300", "Fixed Assets", AccountType.ASSET),
    ("1310", "Accumulated Depreciation", AccountType.ASSET),
    ("2100", "Loans Payable", AccountType.LIABILITY),
    ("2200", "Accounts Payable", AccountType.LIABILITY),
    ("2300", "Tax Payable", AccountType.LIABILITY),
    ("2400", "Accrued Expenses", AccountType.LIABILITY),
    ("3100", "Owner's Equity", AccountType.EQUITY),
    ("3200", "Retained Earnings", AccountType.EQUITY),
    ("4100", "Sales Revenue", AccountType.REVENUE),
    ("4200", "Service Revenue", AccountType.REVENUE),
    ("4300", "Interest Income", AccountType.REVENUE),
    ("4400", "Other Income", AccountType.REVENUE),
    ("5100", "Office Supplies Expense", AccountType.EXPENSE),
    ("5150", "Marketing Expense", AccountType.EXPENSE),
    ("5160", "Software & Subscriptions", AccountType.EXPENSE),
    ("5200", "Travel Expense", AccountType.EXPENSE),
    ("5300", "Meals & Entertainment", AccountType.EXPENSE),
    ("5400", "Utilities Expense", AccountType.EXPENSE),
    ("5500", "Rent Expense", AccountType.EXPENSE),
    ("5600", "Salary & Wages", AccountType.EXPENSE),
    ("5700", "Insurance Expense", AccountType.EXPENSE),
    ("5800", "Professional Services", AccountType.EXPENSE),
    ("5900", "Bank Charges", AccountType.EXPENSE),
    ("5999", "Miscellaneous Expense", AccountType.EXPENSE),
    ("6100", "Depreciation Expense", AccountType.EXPENSE),
    ("6200", "Cost of Goods Sold", AccountType.EXPENSE),
]


def seed_accounts(db: Session) -> list[Account]:
    existing = db.query(Account).count()
    if existing > 0:
        return list(db.query(Account).all())

    accounts = []
    for code, name, acc_type in DEFAULT_CHART_OF_ACCOUNTS:
        account = Account(code=code, name=name, account_type=acc_type)
        db.add(account)
        accounts.append(account)

    db.commit()
    for acc in accounts:
        db.refresh(acc)

    log_action(db, "SEED_ACCOUNTS", "system", 0,
               details=f"Seeded {len(accounts)} default accounts")
    return accounts


def create_account(db: Session, data: AccountCreate) -> Account:
    account = Account(
        code=data.code,
        name=data.name,
        account_type=AccountType(data.account_type),
        parent_id=data.parent_id,
        description=data.description,
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    log_action(db, "CREATE_ACCOUNT", "account", account.id,
               after_state={"code": account.code, "name": account.name},
               details=f"Created account {account.code} - {account.name}")
    return account


def get_accounts(db: Session, active_only: bool = True) -> list[Account]:
    query = db.query(Account)
    if active_only:
        query = query.filter(Account.is_active.is_(True))
    return list(query.order_by(Account.code).all())


def get_account_by_code(db: Session, code: str) -> Account | None:
    return db.query(Account).filter(Account.code == code).first()


def _generate_entry_number(db: Session) -> str:
    count = db.query(JournalEntry).count()
    return f"JE-{count + 1:06d}"


def create_journal_entry(db: Session, data: JournalEntryCreate) -> JournalEntry:
    total_debit = sum(line.debit for line in data.lines)
    total_credit = sum(line.credit for line in data.lines)

    if abs(total_debit - total_credit) > 0.01:
        raise ValueError(
            f"Journal entry not balanced: debit={total_debit}, credit={total_credit}"
        )

    if not data.lines:
        raise ValueError("Journal entry must have at least one line")

    for line_data in data.lines:
        account = db.query(Account).filter(Account.id == line_data.account_id).first()
        if not account:
            raise ValueError(f"Account ID {line_data.account_id} not found")

    entry = JournalEntry(
        entry_number=_generate_entry_number(db),
        date=data.date,
        description=data.description,
        reference=data.reference,
        total_debit=total_debit,
        total_credit=total_credit,
    )
    db.add(entry)
    db.flush()

    for line_data in data.lines:
        line = JournalLine(
            journal_entry_id=entry.id,
            account_id=line_data.account_id,
            debit=line_data.debit,
            credit=line_data.credit,
            description=line_data.description,
        )
        db.add(line)

    db.commit()
    db.refresh(entry)

    log_action(db, "CREATE_JOURNAL_ENTRY", "journal_entry", entry.id,
               after_state={"number": entry.entry_number, "amount": total_debit},
               details=f"Created journal entry {entry.entry_number}")
    return entry


def approve_journal_entry(db: Session, entry_id: int, approved_by: str = "admin") -> JournalEntry:
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise ValueError(f"Journal entry {entry_id} not found")

    if entry.status != TransactionStatus.PENDING:
        raise ValueError(f"Entry is not pending, current status: {entry.status}")

    entry.status = TransactionStatus.APPROVED
    entry.approved_by = approved_by
    db.commit()
    db.refresh(entry)

    log_action(db, "APPROVE_JOURNAL_ENTRY", "journal_entry", entry.id,
               details=f"Approved by {approved_by}")
    return entry


def post_journal_entry(db: Session, entry_id: int) -> JournalEntry:
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise ValueError(f"Journal entry {entry_id} not found")

    if entry.status != TransactionStatus.APPROVED:
        raise ValueError(f"Entry must be approved before posting, current status: {entry.status}")

    for line in entry.lines:
        account = db.query(Account).filter(Account.id == line.account_id).first()
        if not account:
            raise ValueError(f"Account {line.account_id} not found")

        if account.account_type in (AccountType.ASSET, AccountType.EXPENSE):
            account.balance += line.debit - line.credit
        else:
            account.balance += line.credit - line.debit

    entry.status = TransactionStatus.POSTED
    entry.posted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(entry)

    log_action(db, "POST_JOURNAL_ENTRY", "journal_entry", entry.id,
               details=f"Posted entry {entry.entry_number}, amount: {entry.total_debit}")
    return entry


def get_journal_entries(db: Session, status: str | None = None) -> list[JournalEntry]:
    query = db.query(JournalEntry)
    if status:
        query = query.filter(JournalEntry.status == TransactionStatus(status))
    return list(query.order_by(JournalEntry.date.desc()).all())


def create_transaction(db: Session, data: TransactionCreate) -> Transaction:
    classification = classify_transaction(
        description=data.description,
        amount=data.amount,
        transaction_type=data.transaction_type,
        counterparty=data.counterparty,
    )

    transaction = Transaction(
        date=data.date,
        description=data.description,
        amount=data.amount,
        transaction_type=data.transaction_type,
        category=data.category or classification.category,
        counterparty=data.counterparty,
        ai_classification=classification.category,
        ai_confidence=classification.confidence,
        tax_category=data.tax_category or classification.tax_category,
        notes=data.notes,
        status=TransactionStatus.PENDING,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    log_action(db, "CREATE_TRANSACTION", "transaction", transaction.id,
               after_state={
                   "amount": transaction.amount,
                   "category": transaction.category,
                   "ai_confidence": classification.confidence,
               },
               details=f"AI classified as: {classification.category} "
                       f"(confidence: {classification.confidence:.0%}). "
                       f"Reasoning: {classification.reasoning}")
    return transaction


def approve_transaction(
    db: Session,
    transaction_id: int,
    approved: bool,
    category_override: str | None = None,
    notes: str | None = None,
) -> Transaction:
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise ValueError(f"Transaction {transaction_id} not found")

    if not approved:
        txn.status = TransactionStatus.REJECTED
        if notes:
            txn.notes = (txn.notes or "") + f"\nRejection: {notes}"
        db.commit()
        db.refresh(txn)
        log_action(db, "REJECT_TRANSACTION", "transaction", txn.id,
                   details=f"Rejected. Notes: {notes}")
        return txn

    if category_override:
        txn.category = category_override

    debit_code = "5999"
    credit_code = "1100"

    from app.services.classification_service import CATEGORY_TO_ACCOUNT_MAP
    cat = txn.category or txn.ai_classification or "uncategorized"
    if cat in CATEGORY_TO_ACCOUNT_MAP:
        debit_code = CATEGORY_TO_ACCOUNT_MAP[cat]["debit"]
        credit_code = CATEGORY_TO_ACCOUNT_MAP[cat]["credit"]

    debit_account = get_account_by_code(db, debit_code)
    credit_account = get_account_by_code(db, credit_code)

    if not debit_account or not credit_account:
        raise ValueError(f"Accounts not found for codes: {debit_code}, {credit_code}")

    from app.models.schemas import JournalLineCreate
    je_data = JournalEntryCreate(
        date=txn.date,
        description=txn.description,
        reference=f"TXN-{txn.id}",
        lines=[
            JournalLineCreate(account_id=debit_account.id, debit=abs(txn.amount), credit=0),
            JournalLineCreate(account_id=credit_account.id, debit=0, credit=abs(txn.amount)),
        ],
    )

    journal_entry = create_journal_entry(db, je_data)
    journal_entry = approve_journal_entry(db, journal_entry.id)
    journal_entry = post_journal_entry(db, journal_entry.id)

    txn.status = TransactionStatus.POSTED
    txn.journal_entry_id = journal_entry.id
    if notes:
        txn.notes = (txn.notes or "") + f"\nApproval: {notes}"
    db.commit()
    db.refresh(txn)

    log_action(db, "APPROVE_TRANSACTION", "transaction", txn.id,
               details=f"Approved and posted as {journal_entry.entry_number}")
    return txn


def get_transactions(db: Session, status: str | None = None) -> list[Transaction]:
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == TransactionStatus(status))
    return list(query.order_by(Transaction.date.desc()).all())


def get_trial_balance(db: Session, as_of_date: datetime | None = None) -> TrialBalanceResponse:
    if as_of_date is None:
        as_of_date = datetime.now(timezone.utc)

    accounts = db.query(Account).filter(Account.is_active.is_(True)).order_by(Account.code).all()
    items = []
    total_debit = 0.0
    total_credit = 0.0

    for account in accounts:
        if account.balance == 0:
            continue

        debit = max(account.balance, 0) if account.account_type in (
            AccountType.ASSET, AccountType.EXPENSE
        ) else max(-account.balance, 0)

        credit = max(account.balance, 0) if account.account_type in (
            AccountType.LIABILITY, AccountType.EQUITY, AccountType.REVENUE
        ) else max(-account.balance, 0)

        if debit > 0 or credit > 0:
            items.append(TrialBalanceItem(
                account_id=account.id,
                account_code=account.code,
                account_name=account.name,
                account_type=account.account_type.value,
                debit=round(debit, 2),
                credit=round(credit, 2),
            ))
            total_debit += debit
            total_credit += credit

    return TrialBalanceResponse(
        as_of_date=as_of_date,
        items=items,
        total_debit=round(total_debit, 2),
        total_credit=round(total_credit, 2),
        is_balanced=abs(total_debit - total_credit) < 0.01,
    )


def get_income_statement(
    db: Session,
    start_date: datetime,
    end_date: datetime,
) -> IncomeStatementResponse:
    revenue_accounts = db.query(Account).filter(
        Account.account_type == AccountType.REVENUE,
        Account.is_active.is_(True),
    ).all()

    expense_accounts = db.query(Account).filter(
        Account.account_type == AccountType.EXPENSE,
        Account.is_active.is_(True),
    ).all()

    revenue_lines = []
    total_revenue = 0.0
    for acc in revenue_accounts:
        if acc.balance != 0:
            revenue_lines.append(FinancialStatementLine(
                account_code=acc.code,
                account_name=acc.name,
                amount=round(acc.balance, 2),
            ))
            total_revenue += acc.balance

    expense_lines = []
    total_expenses = 0.0
    for acc in expense_accounts:
        if acc.balance != 0:
            expense_lines.append(FinancialStatementLine(
                account_code=acc.code,
                account_name=acc.name,
                amount=round(acc.balance, 2),
            ))
            total_expenses += acc.balance

    return IncomeStatementResponse(
        period_start=start_date,
        period_end=end_date,
        revenue=FinancialStatementSection(
            title="Revenue",
            lines=revenue_lines,
            total=round(total_revenue, 2),
        ),
        expenses=FinancialStatementSection(
            title="Expenses",
            lines=expense_lines,
            total=round(total_expenses, 2),
        ),
        net_income=round(total_revenue - total_expenses, 2),
    )


def get_balance_sheet(db: Session, as_of_date: datetime | None = None) -> BalanceSheetResponse:
    if as_of_date is None:
        as_of_date = datetime.now(timezone.utc)

    def get_section(acc_type: AccountType, title: str) -> FinancialStatementSection:
        accounts = db.query(Account).filter(
            Account.account_type == acc_type,
            Account.is_active.is_(True),
        ).order_by(Account.code).all()

        lines = []
        total = 0.0
        for acc in accounts:
            if acc.balance != 0:
                lines.append(FinancialStatementLine(
                    account_code=acc.code,
                    account_name=acc.name,
                    amount=round(acc.balance, 2),
                ))
                total += acc.balance
        return FinancialStatementSection(title=title, lines=lines, total=round(total, 2))

    assets = get_section(AccountType.ASSET, "Assets")
    liabilities = get_section(AccountType.LIABILITY, "Liabilities")

    equity_section = get_section(AccountType.EQUITY, "Equity")
    revenue_total = sum(
        acc.balance for acc in db.query(Account).filter(
            Account.account_type == AccountType.REVENUE
        ).all()
    )
    expense_total = sum(
        acc.balance for acc in db.query(Account).filter(
            Account.account_type == AccountType.EXPENSE
        ).all()
    )
    net_income = revenue_total - expense_total
    if abs(net_income) > 0.01:
        equity_section.lines.append(FinancialStatementLine(
            account_code="NET",
            account_name="Net Income (Current Period)",
            amount=round(net_income, 2),
        ))
        equity_section.total = round(equity_section.total + net_income, 2)

    total_le = round(liabilities.total + equity_section.total, 2)

    return BalanceSheetResponse(
        as_of_date=as_of_date,
        assets=assets,
        liabilities=liabilities,
        equity=equity_section,
        total_assets=assets.total,
        total_liabilities_equity=total_le,
        is_balanced=abs(assets.total - total_le) < 0.01,
    )


def get_cash_flow(
    db: Session,
    start_date: datetime,
    end_date: datetime,
) -> CashFlowResponse:
    posted_entries = db.query(JournalEntry).filter(
        JournalEntry.status == TransactionStatus.POSTED,
        JournalEntry.date >= start_date,
        JournalEntry.date <= end_date,
    ).all()

    operating_items: list[CashFlowItem] = []
    investing_items: list[CashFlowItem] = []
    financing_items: list[CashFlowItem] = []

    for entry in posted_entries:
        cash_effect = 0.0
        non_cash_account_type = None

        for line in entry.lines:
            account = db.query(Account).filter(Account.id == line.account_id).first()
            if not account:
                continue
            if account.code == "1100":
                cash_effect += line.debit - line.credit
            else:
                non_cash_account_type = account.account_type

        if abs(cash_effect) < 0.01:
            continue

        item = CashFlowItem(description=entry.description, amount=round(cash_effect, 2))

        if non_cash_account_type in (AccountType.REVENUE, AccountType.EXPENSE, AccountType.LIABILITY):
            operating_items.append(item)
        elif non_cash_account_type == AccountType.ASSET:
            investing_items.append(item)
        elif non_cash_account_type == AccountType.EQUITY:
            financing_items.append(item)
        else:
            operating_items.append(item)

    operating_total = sum(i.amount for i in operating_items)
    investing_total = sum(i.amount for i in investing_items)
    financing_total = sum(i.amount for i in financing_items)

    cash_account = get_account_by_code(db, "1100")
    closing = cash_account.balance if cash_account else 0.0
    net_change = operating_total + investing_total + financing_total
    opening = closing - net_change

    return CashFlowResponse(
        period_start=start_date,
        period_end=end_date,
        operating=CashFlowSection(title="Operating Activities", items=operating_items, total=round(operating_total, 2)),
        investing=CashFlowSection(title="Investing Activities", items=investing_items, total=round(investing_total, 2)),
        financing=CashFlowSection(title="Financing Activities", items=financing_items, total=round(financing_total, 2)),
        net_change=round(net_change, 2),
        opening_balance=round(opening, 2),
        closing_balance=round(closing, 2),
    )


def get_dashboard(db: Session) -> DashboardResponse:
    accounts = {acc.code: acc for acc in db.query(Account).all()}

    total_revenue = sum(
        acc.balance for acc in accounts.values()
        if acc.account_type == AccountType.REVENUE
    )
    total_expenses = sum(
        acc.balance for acc in accounts.values()
        if acc.account_type == AccountType.EXPENSE
    )
    total_assets = sum(
        acc.balance for acc in accounts.values()
        if acc.account_type == AccountType.ASSET
    )
    total_liabilities = sum(
        acc.balance for acc in accounts.values()
        if acc.account_type == AccountType.LIABILITY
    )
    total_equity = sum(
        acc.balance for acc in accounts.values()
        if acc.account_type == AccountType.EQUITY
    )

    cash_balance = accounts.get("1100", Account(balance=0)).balance
    ar_balance = accounts.get("1210", Account(balance=0)).balance
    ap_balance = accounts.get("2200", Account(balance=0)).balance

    pending_count = db.query(func.count(Transaction.id)).filter(
        Transaction.status == TransactionStatus.PENDING
    ).scalar() or 0

    recent = db.query(Transaction).order_by(
        Transaction.created_at.desc()
    ).limit(10).all()

    net_income = total_revenue - total_expenses
    net_margin = (net_income / total_revenue * 100) if total_revenue > 0 else 0

    kpis = [
        DashboardKPI(label="Net Profit Margin", value=round(net_margin, 1), trend="up" if net_margin > 0 else "down"),
        DashboardKPI(label="Current Ratio", value=round(total_assets / total_liabilities, 2) if total_liabilities > 0 else 0),
        DashboardKPI(label="Working Capital", value=round(total_assets - total_liabilities, 2)),
        DashboardKPI(label="Debt-to-Equity", value=round(total_liabilities / total_equity, 2) if total_equity > 0 else 0),
    ]

    return DashboardResponse(
        total_revenue=round(total_revenue, 2),
        total_expenses=round(total_expenses, 2),
        net_income=round(net_income, 2),
        total_assets=round(total_assets, 2),
        total_liabilities=round(total_liabilities, 2),
        total_equity=round(total_equity, 2),
        cash_balance=round(cash_balance, 2),
        accounts_receivable=round(ar_balance, 2),
        accounts_payable=round(ap_balance, 2),
        pending_transactions=pending_count,
        recent_transactions=[TransactionResponse.model_validate(t) for t in recent],
        kpis=kpis,
    )


def get_ratio_analysis(db: Session) -> RatioAnalysis:
    accounts = {acc.code: acc for acc in db.query(Account).all()}

    total_assets = sum(a.balance for a in accounts.values() if a.account_type == AccountType.ASSET)
    total_liabilities = sum(a.balance for a in accounts.values() if a.account_type == AccountType.LIABILITY)
    total_equity = sum(a.balance for a in accounts.values() if a.account_type == AccountType.EQUITY)
    total_revenue = sum(a.balance for a in accounts.values() if a.account_type == AccountType.REVENUE)
    total_expenses = sum(a.balance for a in accounts.values() if a.account_type == AccountType.EXPENSE)

    net_income = total_revenue - total_expenses
    current_assets = total_assets
    current_liabilities = total_liabilities

    return RatioAnalysis(
        current_ratio=round(current_assets / current_liabilities, 2) if current_liabilities > 0 else None,
        debt_to_equity=round(total_liabilities / total_equity, 2) if total_equity > 0 else None,
        net_margin=round(net_income / total_revenue * 100, 2) if total_revenue > 0 else None,
        return_on_assets=round(net_income / total_assets * 100, 2) if total_assets > 0 else None,
        return_on_equity=round(net_income / total_equity * 100, 2) if total_equity > 0 else None,
        asset_turnover=round(total_revenue / total_assets, 2) if total_assets > 0 else None,
        working_capital=round(current_assets - current_liabilities, 2),
    )
