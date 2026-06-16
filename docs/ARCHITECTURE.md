# Sudarshan Architecture

## Product Principle

Sudarshan separates financial truth from AI interpretation.

- AI suggests classification, explanations, anomalies, and report language.
- The accounting engine validates every journal entry deterministically.
- The ledger stores only balanced, auditable postings.

## System Layers

1. Web workspace for accountants and SMB operators.
2. FastAPI service boundary for companies, transactions, reports, and advisory output.
3. Accounting service for journal validation, ledger posting, GST splitting, and audit events.
4. Classification service for rule-assisted transaction mapping.
5. Reporting service for trial balance, P&L, balance sheet, cash flow, and GST summaries.
6. PostgreSQL source-of-truth database, with SQLite fallback for fast local development.

## Core Data Flow

```text
Manual entry or document placeholder
  -> transaction draft
  -> rule/AI classification
  -> deterministic journal validation
  -> automatic posting
  -> ledger lines and audit event
  -> reports and AI-style advisory summaries
```

## v1 Safety Model

The MVP follows "auto-post after deterministic validation." It does not let a language model directly mutate the ledger. If a transaction cannot be classified, references missing accounts, creates an unbalanced journal, or duplicates an existing posted draft, it is moved to the exception queue.

## Future AI Gateway

The current classifier is deterministic and explainable. A production LLM gateway can later be added behind the same classification contract:

- extract fields from invoices and receipts,
- rank candidate accounts,
- generate natural-language reasoning,
- identify anomalies,
- draft advisory and research reports.

All LLM output must still pass accounting validation.

