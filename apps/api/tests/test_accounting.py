from datetime import date
from decimal import Decimal
from types import SimpleNamespace

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sudarshan.database import Base
from sudarshan.models import Company, DraftStatus, LedgerLine
from sudarshan.services.accounting import (
    PostingLine,
    create_company_with_template,
    post_classified_transaction,
    validate_journal_lines,
)
from sudarshan.services.classifier import classify_manual_transaction
from sudarshan.services.reports import balance_sheet, gst_summary, profit_loss, trial_balance


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, future=True)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def payload(**overrides):
    data = {
        "entry_date": date(2026, 5, 28),
        "description": "Office rent for May",
        "amount": Decimal("50000.00"),
        "flow": "expense",
        "counterparty": "Landlord",
        "gst_rate": Decimal("18.00"),
        "gst_treatment": "intra_state",
        "payment_account_code": "1010",
        "source_document_id": None,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


def make_company(db) -> Company:
    return create_company_with_template(
        db,
        "Demo Traders",
        "27ABCDE1234F1Z5",
        date(2026, 4, 1),
        date(2027, 3, 31),
        "demo123",
    )


def test_validate_journal_lines_rejects_unbalanced_entry():
    with pytest.raises(ValueError, match="Unbalanced"):
        validate_journal_lines(
            [
                PostingLine("1010", debit=Decimal("100.00")),
                PostingLine("4000", credit=Decimal("90.00")),
            ]
        )


def test_manual_expense_posts_balanced_ledger_and_gst_split(db):
    company = make_company(db)
    request = payload()
    classification = classify_manual_transaction(request)

    draft, journal = post_classified_transaction(db, company.id, request, classification)

    assert draft.status == DraftStatus.POSTED
    assert journal.entry_number == "JE-00001"

    lines = db.query(LedgerLine).filter(LedgerLine.journal_entry_id == journal.id).all()
    assert sum(line.debit for line in lines) == Decimal("59000.00")
    assert sum(line.credit for line in lines) == Decimal("59000.00")

    buckets = {line.gst_bucket: line.debit - line.credit for line in lines if line.gst_bucket}
    assert buckets["input_cgst"] == Decimal("4500.00")
    assert buckets["input_sgst"] == Decimal("4500.00")

    tb = trial_balance(db, company.id)
    assert tb.is_balanced is True
    assert tb.total_debit == tb.total_credit


def test_sale_updates_profit_loss_balance_sheet_and_output_gst(db):
    company = make_company(db)
    request = payload(
        description="Consulting sale invoice",
        amount=Decimal("100000.00"),
        flow="sale",
        gst_treatment="inter_state",
    )

    post_classified_transaction(db, company.id, request, classify_manual_transaction(request))

    pnl = profit_loss(db, company.id)
    assert pnl.income == Decimal("100000.00")
    assert pnl.expenses == Decimal("0.00")
    assert pnl.net_profit == Decimal("100000.00")

    gst = gst_summary(db, company.id)
    assert gst.output_gst == Decimal("18000.00")
    assert gst.net_payable == Decimal("18000.00")

    bs = balance_sheet(db, company.id)
    assert bs.balanced is True


def test_duplicate_posted_transaction_becomes_exception(db):
    company = make_company(db)
    request = payload(description="Monthly software subscription", amount=Decimal("2000.00"))
    post_classified_transaction(db, company.id, request, classify_manual_transaction(request))

    with pytest.raises(ValueError, match="Potential duplicate"):
        post_classified_transaction(db, company.id, request, classify_manual_transaction(request))

