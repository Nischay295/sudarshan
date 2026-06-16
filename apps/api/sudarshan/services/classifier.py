from decimal import Decimal

from .accounting import ClassificationResult, PostingLine, money

ZERO = Decimal("0.00")


def _expense_account(description: str) -> tuple[str, str]:
    text = description.lower()
    if "rent" in text or "lease" in text:
        return "5100", "rent keyword matched"
    if "travel" in text or "flight" in text or "hotel" in text or "cab" in text:
        return "5120", "travel keyword matched"
    if "salary" in text or "payroll" in text or "wage" in text:
        return "5130", "salary keyword matched"
    if "professional" in text or "legal" in text or "consult" in text or "audit" in text:
        return "5140", "professional services keyword matched"
    if "bank charge" in text or "fee" in text:
        return "5150", "bank charge keyword matched"
    return "5110", "default office expense mapping"


def _gst_lines(base_amount: Decimal, rate: Decimal, treatment: str, direction: str) -> tuple[list[PostingLine], Decimal]:
    if treatment in {"none", "exempt"} or money(rate) == ZERO:
        return [], ZERO

    gst_total = money(base_amount * money(rate) / Decimal("100"))
    if gst_total == ZERO:
        return [], ZERO

    if direction == "input":
        if treatment == "inter_state":
            return [PostingLine("1220", debit=gst_total, description="Input IGST", gst_bucket="input_igst")], gst_total
        half = money(gst_total / Decimal("2"))
        return [
            PostingLine("1200", debit=half, description="Input CGST", gst_bucket="input_cgst"),
            PostingLine("1210", debit=money(gst_total - half), description="Input SGST", gst_bucket="input_sgst"),
        ], gst_total

    if treatment == "inter_state":
        return [PostingLine("2120", credit=gst_total, description="Output IGST", gst_bucket="output_igst")], gst_total
    half = money(gst_total / Decimal("2"))
    return [
        PostingLine("2100", credit=half, description="Output CGST", gst_bucket="output_cgst"),
        PostingLine("2110", credit=money(gst_total - half), description="Output SGST", gst_bucket="output_sgst"),
    ], gst_total


def classify_manual_transaction(payload) -> ClassificationResult:
    base = money(payload.amount)
    rate = money(payload.gst_rate)
    payment_account = payload.payment_account_code or "1010"
    lines: list[PostingLine] = []
    warnings: list[str] = []
    reason = ""
    confidence = Decimal("0.9400")

    if payload.flow == "sale":
        gst_lines, gst_total = _gst_lines(base, rate, payload.gst_treatment, "output")
        lines.append(PostingLine(payment_account, debit=money(base + gst_total), description="Customer receipt or receivable"))
        lines.append(PostingLine("4000", credit=base, description="Sales revenue"))
        lines.extend(gst_lines)
        reason = "Mapped sale to bank debit, sales revenue credit, and output GST where applicable."

    elif payload.flow == "income":
        gst_lines, gst_total = _gst_lines(base, rate, payload.gst_treatment, "output")
        lines.append(PostingLine(payment_account, debit=money(base + gst_total), description="Income receipt"))
        lines.append(PostingLine("4100", credit=base, description="Service income"))
        lines.extend(gst_lines)
        reason = "Mapped income to bank debit, service income credit, and output GST where applicable."

    elif payload.flow == "purchase":
        gst_lines, gst_total = _gst_lines(base, rate, payload.gst_treatment, "input")
        lines.append(PostingLine("5000", debit=base, description="Purchase expense"))
        lines.extend(gst_lines)
        lines.append(PostingLine(payment_account, credit=money(base + gst_total), description="Vendor payment or payable"))
        reason = "Mapped purchase to purchase debit, input GST, and bank credit."

    elif payload.flow == "expense":
        account_code, match_reason = _expense_account(payload.description)
        gst_lines, gst_total = _gst_lines(base, rate, payload.gst_treatment, "input")
        lines.append(PostingLine(account_code, debit=base, description="Expense recognized"))
        lines.extend(gst_lines)
        lines.append(PostingLine(payment_account, credit=money(base + gst_total), description="Expense paid"))
        reason = f"Mapped expense using {match_reason}, input GST, and bank credit."
        confidence = Decimal("0.8800") if account_code == "5110" else Decimal("0.9300")

    elif payload.flow == "receipt":
        lines.append(PostingLine(payment_account, debit=base, description="Receipt collected"))
        lines.append(PostingLine("1100", credit=base, description="Accounts receivable reduced"))
        reason = "Mapped receipt to bank debit and accounts receivable credit."

    elif payload.flow == "payment":
        lines.append(PostingLine("2000", debit=base, description="Accounts payable reduced"))
        lines.append(PostingLine(payment_account, credit=base, description="Payment made"))
        reason = "Mapped payment to accounts payable debit and bank credit."

    elif payload.flow == "owner_contribution":
        lines.append(PostingLine(payment_account, debit=base, description="Capital introduced"))
        lines.append(PostingLine("3000", credit=base, description="Owner capital"))
        reason = "Mapped owner contribution to bank debit and capital credit."

    elif payload.flow == "loan_received":
        lines.append(PostingLine(payment_account, debit=base, description="Loan proceeds received"))
        lines.append(PostingLine("2300", credit=base, description="Loan payable"))
        reason = "Mapped loan received to bank debit and loan payable credit."

    else:
        warnings.append("Unsupported transaction flow.")
        confidence = Decimal("0.0000")

    if payload.gst_treatment in {"intra_state", "inter_state"} and rate == ZERO:
        warnings.append("GST treatment was selected but GST rate is zero.")
        confidence = min(confidence, Decimal("0.7000"))

    return ClassificationResult(lines=lines, confidence_score=confidence, reason=reason, warnings=warnings)

