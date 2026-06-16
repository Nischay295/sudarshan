from dataclasses import dataclass
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from ..models import (
    Account,
    AccountType,
    AuditEvent,
    Company,
    DraftStatus,
    JournalEntry,
    LedgerLine,
    NormalBalance,
    TransactionDraft,
    Branch,
)

MONEY = Decimal("0.01")
ZERO = Decimal("0.00")


def money(value: Decimal | int | str) -> Decimal:
    return Decimal(str(value)).quantize(MONEY, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class PostingLine:
    account_code: str
    debit: Decimal = ZERO
    credit: Decimal = ZERO
    description: str = ""
    gst_bucket: str | None = None


@dataclass(frozen=True)
class ClassificationResult:
    lines: list[PostingLine]
    confidence_score: Decimal
    reason: str
    warnings: list[str]


CHART_OF_ACCOUNTS_TEMPLATE: tuple[tuple[str, str, AccountType, NormalBalance], ...] = (
    ("1000", "Cash", AccountType.ASSET, NormalBalance.DEBIT),
    ("1010", "Bank", AccountType.ASSET, NormalBalance.DEBIT),
    ("1100", "Accounts Receivable", AccountType.ASSET, NormalBalance.DEBIT),
    ("1200", "Input CGST", AccountType.ASSET, NormalBalance.DEBIT),
    ("1210", "Input SGST", AccountType.ASSET, NormalBalance.DEBIT),
    ("1220", "Input IGST", AccountType.ASSET, NormalBalance.DEBIT),
    ("1300", "Inventory", AccountType.ASSET, NormalBalance.DEBIT),
    ("1500", "Fixed Assets", AccountType.ASSET, NormalBalance.DEBIT),
    ("2000", "Accounts Payable", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("2100", "Output CGST", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("2110", "Output SGST", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("2120", "Output IGST", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("2200", "GST Payable", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("2300", "Loan Payable", AccountType.LIABILITY, NormalBalance.CREDIT),
    ("3000", "Owner Capital", AccountType.EQUITY, NormalBalance.CREDIT),
    ("4000", "Sales Revenue", AccountType.INCOME, NormalBalance.CREDIT),
    ("4100", "Service Income", AccountType.INCOME, NormalBalance.CREDIT),
    ("5000", "Purchases", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5100", "Rent Expense", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5110", "Office Expense", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5120", "Travel Expense", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5130", "Salaries Expense", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5140", "Professional Fees", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5150", "Bank Charges", AccountType.EXPENSE, NormalBalance.DEBIT),
    ("5200", "Cost of Goods Sold", AccountType.EXPENSE, NormalBalance.DEBIT),
)


def seed_chart_of_accounts(db: Session, company_id: str) -> None:
    existing_count = db.query(Account).filter(Account.company_id == company_id).count()
    if existing_count:
        return

    for code, name, account_type, normal_balance in CHART_OF_ACCOUNTS_TEMPLATE:
        db.add(
            Account(
                company_id=company_id,
                code=code,
                name=name,
                type=account_type,
                normal_balance=normal_balance,
                is_system=True,
            )
        )


def create_company_with_template(db: Session, name: str, gstin: str | None, fy_start: date, fy_end: date, password: str) -> Company:
    from .auth import hash_password
    company = Company(
        name=name,
        gstin=gstin,
        financial_year_start=fy_start,
        financial_year_end=fy_end,
        password_hash=hash_password(password)
    )
    db.add(company)
    db.flush()
    # Create default Main Branch
    main_branch = Branch(
        company_id=company.id,
        name="Main Branch",
        code="MAIN"
    )
    db.add(main_branch)
    db.flush()
    seed_chart_of_accounts(db, company.id)
    db.add(
        AuditEvent(
            company_id=company.id,
            actor="system",
            action="company.created",
            entity_type="company",
            entity_id=company.id,
            details="Company created with Indian chart-of-accounts template.",
        )
    )
    db.commit()
    db.refresh(company)
    return company


def validate_journal_lines(lines: list[PostingLine]) -> None:
    if len(lines) < 2:
        raise ValueError("A journal entry needs at least two ledger lines.")

    total_debit = ZERO
    total_credit = ZERO
    for line in lines:
        debit = money(line.debit)
        credit = money(line.credit)
        if debit < ZERO or credit < ZERO:
            raise ValueError("Debit and credit amounts cannot be negative.")
        if debit > ZERO and credit > ZERO:
            raise ValueError("A ledger line cannot contain both debit and credit values.")
        if debit == ZERO and credit == ZERO:
            raise ValueError("A ledger line must contain either a debit or credit value.")
        total_debit += debit
        total_credit += credit

    if money(total_debit) != money(total_credit):
        raise ValueError(f"Unbalanced journal entry: debit {total_debit} does not equal credit {total_credit}.")


def get_account_by_code(db: Session, company_id: str, code: str) -> Account:
    account = db.query(Account).filter(Account.company_id == company_id, Account.code == code).one_or_none()
    if account is None:
        raise ValueError(f"Account code {code} is not available for this company.")
    return account


def create_exception_draft(
    db: Session,
    company_id: str,
    payload,
    reason: str,
) -> TransactionDraft:
    draft = TransactionDraft(
        company_id=company_id,
        branch_id=getattr(payload, "branch_id", None),
        source_document_id=payload.source_document_id,
        entry_date=payload.entry_date,
        description=payload.description,
        amount=money(payload.amount),
        flow=payload.flow,
        counterparty=payload.counterparty,
        gst_rate=money(payload.gst_rate),
        gst_treatment=payload.gst_treatment,
        confidence_score=Decimal("0.0000"),
        status=DraftStatus.EXCEPTION,
        exception_reason=reason,
    )
    db.add(draft)
    db.flush()
    db.add(
        AuditEvent(
            company_id=company_id,
            actor="system",
            action="transaction.exception",
            entity_type="transaction_draft",
            entity_id=draft.id,
            details=reason,
        )
    )
    db.commit()
    db.refresh(draft)
    return draft


def duplicate_posted_draft_exists(db: Session, company_id: str, payload) -> bool:
    return (
        db.query(TransactionDraft)
        .filter(
            TransactionDraft.company_id == company_id,
            TransactionDraft.entry_date == payload.entry_date,
            TransactionDraft.amount == money(payload.amount),
            TransactionDraft.description == payload.description,
            TransactionDraft.status == DraftStatus.POSTED,
        )
        .first()
        is not None
    )


def post_classified_transaction(
    db: Session,
    company_id: str,
    payload,
    classification: ClassificationResult,
) -> tuple[TransactionDraft, JournalEntry]:
    if duplicate_posted_draft_exists(db, company_id, payload):
        draft = create_exception_draft(
            db,
            company_id,
            payload,
            "Potential duplicate: a posted draft with the same date, amount, and description already exists.",
        )
        raise ValueError(draft.exception_reason or "Duplicate transaction.")

    validate_journal_lines(classification.lines)

    account_map = {
        line.account_code: get_account_by_code(db, company_id, line.account_code)
        for line in classification.lines
    }

    branch_id = getattr(payload, "branch_id", None)
    draft = TransactionDraft(
        company_id=company_id,
        branch_id=branch_id,
        source_document_id=payload.source_document_id,
        entry_date=payload.entry_date,
        description=payload.description,
        amount=money(payload.amount),
        flow=payload.flow,
        counterparty=payload.counterparty,
        gst_rate=money(payload.gst_rate),
        gst_treatment=payload.gst_treatment,
        confidence_score=classification.confidence_score,
        status=DraftStatus.POSTED,
        classification_reason=classification.reason,
    )
    db.add(draft)
    db.flush()

    sequence = db.query(JournalEntry).filter(JournalEntry.company_id == company_id).count() + 1
    journal = JournalEntry(
        company_id=company_id,
        branch_id=branch_id,
        draft_id=draft.id,
        entry_number=f"JE-{sequence:05d}",
        entry_date=payload.entry_date,
        narration=payload.description,
    )
    db.add(journal)
    db.flush()

    for line in classification.lines:
        account = account_map[line.account_code]
        db.add(
            LedgerLine(
                company_id=company_id,
                journal_entry_id=journal.id,
                account_id=account.id,
                debit=money(line.debit),
                credit=money(line.credit),
                description=line.description or payload.description,
                gst_bucket=line.gst_bucket,
            )
        )

    db.add(
        AuditEvent(
            company_id=company_id,
            actor="system",
            action="journal.auto_posted",
            entity_type="journal_entry",
            entity_id=journal.id,
            details=f"Auto-posted after deterministic validation. Confidence: {classification.confidence_score}.",
        )
    )
    db.commit()
    db.refresh(draft)
    db.refresh(journal)
    return draft, journal

