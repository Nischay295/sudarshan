# Sudarshan API

Base URL: `http://localhost:8000`

## Companies

- `POST /companies` creates a company and seeds the Indian chart of accounts.
- `GET /companies` lists companies.
- `GET /companies/{company_id}/accounts` lists chart of accounts.

## Transactions

- `POST /companies/{company_id}/transactions/manual` creates a draft, classifies it, and auto-posts it when validation passes.
- `GET /companies/{company_id}/transactions` lists drafts.
- `GET /companies/{company_id}/journal-entries` lists posted journals and ledger lines.

Manual transaction payload:

```json
{
  "entry_date": "2026-05-28",
  "description": "Office rent for May",
  "amount": "50000.00",
  "flow": "expense",
  "counterparty": "Landlord",
  "gst_rate": "18",
  "gst_treatment": "intra_state",
  "payment_account_code": "1010"
}
```

`amount` is the taxable base before GST. GST lines are calculated automatically.

## Reports

- `GET /companies/{company_id}/reports/trial-balance`
- `GET /companies/{company_id}/reports/profit-loss`
- `GET /companies/{company_id}/reports/balance-sheet`
- `GET /companies/{company_id}/reports/cash-flow`
- `GET /companies/{company_id}/reports/gst-summary`
- `GET /companies/{company_id}/ai/management-report`

## Documents

- `POST /companies/{company_id}/source-documents` stores a document placeholder and extracted text for future OCR integration.

