from collections import defaultdict
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models import Account, AccountType, LedgerLine
from ..schemas import (
    BalanceSheetReport,
    CashFlowReport,
    GSTSummaryReport,
    ManagementReport,
    ProfitLossReport,
    TrialBalanceReport,
    TrialBalanceRow,
)
from .accounting import money

ZERO = Decimal("0.00")


def _account_totals(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None):
    from ..models import JournalEntry, LedgerLine
    
    # Subquery to aggregate ledger line totals for the company within the date range
    sub = (
        db.query(
            LedgerLine.account_id,
            func.sum(LedgerLine.debit).label("debit"),
            func.sum(LedgerLine.credit).label("credit")
        )
        .join(JournalEntry, LedgerLine.journal_entry_id == JournalEntry.id)
        .filter(LedgerLine.company_id == company_id)
    )
    
    if start_date:
        sub = sub.filter(JournalEntry.entry_date >= start_date)
    if end_date:
        sub = sub.filter(JournalEntry.entry_date <= end_date)
    if branch_id:
        sub = sub.filter(JournalEntry.branch_id == branch_id)
        
    sub = sub.group_by(LedgerLine.account_id).subquery()
    
    # Outer join accounts with the aggregated totals
    rows = (
        db.query(Account, sub.c.debit, sub.c.credit)
        .outerjoin(sub, Account.id == sub.c.account_id)
        .filter(Account.company_id == company_id)
        .order_by(Account.code)
        .all()
    )
    
    totals = []
    for account, debit, credit in rows:
        totals.append({
            "account": account,
            "debit": money(debit) if debit is not None else ZERO,
            "credit": money(credit) if credit is not None else ZERO
        })
    return totals


def trial_balance(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> TrialBalanceReport:
    report_rows: list[TrialBalanceRow] = []
    total_debit = ZERO
    total_credit = ZERO

    for item in _account_totals(db, company_id, start_date, end_date, branch_id):
        account: Account = item["account"]
        debit_total = money(item["debit"])
        credit_total = money(item["credit"])
        balance = money(debit_total - credit_total)
        closing_debit = balance if balance > ZERO else ZERO
        closing_credit = money(abs(balance)) if balance < ZERO else ZERO
        total_debit += closing_debit
        total_credit += closing_credit
        report_rows.append(
            TrialBalanceRow(
                account_code=account.code,
                account_name=account.name,
                account_type=account.type,
                debit_total=debit_total,
                credit_total=credit_total,
                closing_debit=closing_debit,
                closing_credit=closing_credit,
            )
        )

    return TrialBalanceReport(
        rows=report_rows,
        total_debit=money(total_debit),
        total_credit=money(total_credit),
        is_balanced=money(total_debit) == money(total_credit),
    )


def profit_loss(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> ProfitLossReport:
    income = ZERO
    expenses = ZERO
    for item in _account_totals(db, company_id, start_date, end_date, branch_id):
        account: Account = item["account"]
        debit = money(item["debit"])
        credit = money(item["credit"])
        if account.type == AccountType.INCOME:
            income += money(credit - debit)
        elif account.type == AccountType.EXPENSE:
            expenses += money(debit - credit)
    return ProfitLossReport(income=money(income), expenses=money(expenses), net_profit=money(income - expenses))


def balance_sheet(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> BalanceSheetReport:
    assets = ZERO
    liabilities = ZERO
    equity = ZERO
    pnl = profit_loss(db, company_id, start_date, end_date, branch_id)

    for item in _account_totals(db, company_id, start_date, end_date, branch_id):
        account: Account = item["account"]
        debit = money(item["debit"])
        credit = money(item["credit"])
        if account.type == AccountType.ASSET:
            assets += money(debit - credit)
        elif account.type == AccountType.LIABILITY:
            liabilities += money(credit - debit)
        elif account.type == AccountType.EQUITY:
            equity += money(credit - debit)

    right_side = money(liabilities + equity + pnl.net_profit)
    return BalanceSheetReport(
        assets=money(assets),
        liabilities=money(liabilities),
        equity=money(equity),
        current_period_profit=pnl.net_profit,
        balanced=money(assets) == right_side,
    )


def cash_flow(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> CashFlowReport:
    net = ZERO
    bank_codes = {"1000", "1010"}
    for item in _account_totals(db, company_id, start_date, end_date, branch_id):
        account: Account = item["account"]
        if account.code in bank_codes:
            net += money(item["debit"] - item["credit"])
    return CashFlowReport(opening_cash_placeholder=ZERO, net_cash_movement=money(net), closing_cash=money(net))


def gst_summary(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> GSTSummaryReport:
    from ..models import JournalEntry
    buckets = defaultdict(lambda: ZERO)
    query = db.query(LedgerLine).join(JournalEntry, LedgerLine.journal_entry_id == JournalEntry.id).filter(
        LedgerLine.company_id == company_id,
        LedgerLine.gst_bucket.is_not(None)
    )
    if start_date:
        query = query.filter(JournalEntry.entry_date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.entry_date <= end_date)
    if branch_id:
        query = query.filter(JournalEntry.branch_id == branch_id)
        
    lines = query.all()
    for line in lines:
        assert line.gst_bucket is not None
        movement = money(line.debit - line.credit)
        buckets[line.gst_bucket] += movement

    input_gst = money(
        buckets["input_cgst"]
        + buckets["input_sgst"]
        + buckets["input_igst"]
    )
    output_gst = money(abs(buckets["output_cgst"] + buckets["output_sgst"] + buckets["output_igst"]))
    return GSTSummaryReport(
        input_gst=input_gst,
        output_gst=output_gst,
        net_payable=money(output_gst - input_gst),
        buckets={key: money(value) for key, value in sorted(buckets.items())},
    )


def management_report(db: Session, company_id: str, start_date=None, end_date=None, branch_id=None) -> ManagementReport:
    tb = trial_balance(db, company_id, start_date, end_date, branch_id)
    pnl = profit_loss(db, company_id, start_date, end_date, branch_id)
    bs = balance_sheet(db, company_id, start_date, end_date, branch_id)
    gst = gst_summary(db, company_id, start_date, end_date, branch_id)
    notes: list[str] = []
    advice: list[str] = []

    if not tb.is_balanced:
        notes.append("Trial balance is not balanced. Review ledger integrity immediately.")
    if pnl.net_profit < ZERO:
        notes.append("The current period is loss-making based on posted entries.")
    if gst.net_payable > ZERO:
        advice.append(f"Plan liquidity for estimated GST payable of INR {gst.net_payable}.")
    if pnl.net_profit > ZERO:
        advice.append("Review surplus cash allocation only after tax, payroll, and vendor obligations are covered.")
    if not advice:
        advice.append("Continue posting transactions to build a reliable trend base for forecasting.")

    return ManagementReport(
        title="Sudarshan management intelligence report",
        accountant_explanation=(
            f"The ledger contains a balanced trial balance: {tb.is_balanced}. "
            f"Current income is INR {pnl.income}, expenses are INR {pnl.expenses}, and net profit is INR {pnl.net_profit}."
        ),
        management_summary=(
            f"Assets stand at INR {bs.assets}, liabilities at INR {bs.liabilities}, equity at INR {bs.equity}, "
            f"and current-period profit included in the balance sheet is INR {bs.current_period_profit}."
        ),
        anomaly_notes=notes or ["No deterministic accounting anomaly was detected from posted entries."],
        business_advice=advice,
        investment_goal_commentary=(
            "Any investment or goal recommendation should be treated as planning support only. "
            "Use verified books, tax estimates, emergency reserves, and risk profile before committing funds."
        ),
        advisory_disclaimer=(
            "This is AI-assisted business commentary, not statutory audit, tax filing, legal, or investment advice."
        ),
    )

