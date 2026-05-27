"""AI Classification Engine for Sudarshan.

Uses a rule-based system as primary classifier with pattern matching
for smart categorization. Follows the principle: rules first, ML second,
human review for exceptions.
"""

import re
from dataclasses import dataclass

CLASSIFICATION_RULES: dict[str, list[str]] = {
    "office_supplies": [
        "stationery", "office", "supplies", "printer", "paper", "pen",
        "toner", "ink", "folder", "binder", "desk", "chair", "furniture",
    ],
    "travel": [
        "travel", "flight", "hotel", "taxi", "uber", "cab", "airline",
        "boarding", "airport", "train", "bus", "fuel", "petrol", "diesel",
        "toll", "parking",
    ],
    "meals_entertainment": [
        "restaurant", "food", "lunch", "dinner", "breakfast", "cafe",
        "coffee", "catering", "meal", "snack",
    ],
    "utilities": [
        "electricity", "water", "gas", "internet", "phone", "telecom",
        "wifi", "broadband", "mobile", "utility",
    ],
    "rent": [
        "rent", "lease", "office space", "warehouse", "storage",
    ],
    "salary_wages": [
        "salary", "wage", "payroll", "bonus", "compensation", "stipend",
        "commission",
    ],
    "insurance": [
        "insurance", "premium", "policy", "coverage", "claim",
    ],
    "professional_services": [
        "consulting", "legal", "lawyer", "attorney", "audit", "accountant",
        "advisory", "professional", "consultant",
    ],
    "sales_revenue": [
        "sale", "revenue", "income", "receipt", "payment received",
        "customer payment", "invoice paid", "service fee",
    ],
    "bank_charges": [
        "bank charge", "bank fee", "service charge", "atm", "transaction fee",
        "maintenance fee",
    ],
    "tax_payment": [
        "tax", "gst", "vat", "tds", "income tax", "corporate tax",
        "service tax", "cess",
    ],
    "loan": [
        "loan", "emi", "interest", "mortgage", "borrowing", "lending",
        "principal", "repayment",
    ],
    "capital_expenditure": [
        "machinery", "equipment", "vehicle", "computer", "laptop",
        "server", "building", "renovation", "construction",
    ],
    "marketing": [
        "advertising", "marketing", "promotion", "campaign", "social media",
        "google ads", "facebook", "billboard", "brochure",
    ],
    "subscription": [
        "subscription", "saas", "software", "license", "annual", "monthly",
        "renewal",
    ],
    "inventory": [
        "inventory", "stock", "raw material", "goods", "merchandise",
        "purchase", "supplier",
    ],
}

CATEGORY_TO_ACCOUNT_MAP: dict[str, dict[str, str]] = {
    "office_supplies": {"debit": "5100", "credit": "1100"},
    "travel": {"debit": "5200", "credit": "1100"},
    "meals_entertainment": {"debit": "5300", "credit": "1100"},
    "utilities": {"debit": "5400", "credit": "1100"},
    "rent": {"debit": "5500", "credit": "1100"},
    "salary_wages": {"debit": "5600", "credit": "1100"},
    "insurance": {"debit": "5700", "credit": "1100"},
    "professional_services": {"debit": "5800", "credit": "1100"},
    "sales_revenue": {"debit": "1100", "credit": "4100"},
    "bank_charges": {"debit": "5900", "credit": "1100"},
    "tax_payment": {"debit": "2300", "credit": "1100"},
    "loan": {"debit": "2100", "credit": "1100"},
    "capital_expenditure": {"debit": "1300", "credit": "1100"},
    "marketing": {"debit": "5150", "credit": "1100"},
    "subscription": {"debit": "5160", "credit": "1100"},
    "inventory": {"debit": "1200", "credit": "2200"},
}

TAX_CATEGORY_RULES: dict[str, list[str]] = {
    "gst_applicable": [
        "office_supplies", "professional_services", "subscription",
        "marketing", "inventory", "meals_entertainment",
    ],
    "tds_applicable": [
        "salary_wages", "professional_services", "rent",
    ],
    "exempt": [
        "bank_charges", "insurance",
    ],
    "direct_tax": [
        "tax_payment",
    ],
}


@dataclass
class ClassificationResult:
    category: str
    confidence: float
    debit_account: str
    credit_account: str
    tax_category: str
    reasoning: str


def classify_transaction(
    description: str,
    amount: float,
    transaction_type: str,
    counterparty: str | None = None,
) -> ClassificationResult:
    text = f"{description} {counterparty or ''}".lower()
    best_category = "uncategorized"
    best_score = 0.0
    match_details: list[str] = []

    for category, keywords in CLASSIFICATION_RULES.items():
        score = 0.0
        matches: list[str] = []
        for keyword in keywords:
            pattern = re.compile(r"\b" + re.escape(keyword) + r"\b", re.IGNORECASE)
            found = pattern.findall(text)
            if found:
                score += len(found) * (1.0 + len(keyword) * 0.05)
                matches.append(keyword)

        if score > best_score:
            best_score = score
            best_category = category
            match_details = matches

    if transaction_type == "income" and best_category not in ("sales_revenue", "loan"):
        best_category = "sales_revenue"
        best_score = max(best_score, 0.6)

    confidence = min(best_score / 3.0, 1.0) if best_score > 0 else 0.1
    if best_category == "uncategorized":
        confidence = 0.1

    account_map = CATEGORY_TO_ACCOUNT_MAP.get(
        best_category, {"debit": "5999", "credit": "1100"}
    )

    tax_category = "standard"
    for tax_cat, categories in TAX_CATEGORY_RULES.items():
        if best_category in categories:
            tax_category = tax_cat
            break

    reasoning_parts = []
    if match_details:
        reasoning_parts.append(f"Matched keywords: {', '.join(match_details)}")
    reasoning_parts.append(f"Category: {best_category}")
    reasoning_parts.append(f"Confidence: {confidence:.0%}")

    return ClassificationResult(
        category=best_category,
        confidence=round(confidence, 2),
        debit_account=account_map["debit"],
        credit_account=account_map["credit"],
        tax_category=tax_category,
        reasoning=" | ".join(reasoning_parts),
    )
