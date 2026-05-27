# Sudarshan — AI-Driven Commerce Intelligence System

An AI-powered accounting and finance operating system that converts raw financial data into verified accounting entries, reports, and decision support with human oversight, auditability, and compliance controls.

## Features

### Core Accounting Engine (Deterministic)
- **Double-Entry Ledger**: Every transaction maintains debit/credit balance
- **Chart of Accounts**: Pre-configured account structure (Assets, Liabilities, Equity, Revenue, Expenses)
- **Journal Entries**: Automatic journal entry creation with approval workflow
- **Posting**: Approved entries update account balances deterministically

### AI Classification Engine
- **Smart Categorization**: Rule-based primary classification with keyword matching
- **Confidence Scoring**: Each AI classification comes with a confidence score
- **Human Approval**: Low-confidence items require manual review before posting
- **Account Mapping**: Automatic debit/credit account selection based on category

### Financial Reports
- **Trial Balance**: Real-time balanced/unbalanced status
- **Income Statement (P&L)**: Revenue vs expenses with net income
- **Balance Sheet**: Assets = Liabilities + Equity verification
- **Cash Flow Statement**: Operating, investing, and financing activities

### Analytics
- **Dashboard**: KPI cards, charts, and recent transaction overview
- **Ratio Analysis**: Current ratio, debt-to-equity, ROA, ROE, net margin
- **Expense Distribution**: Visual breakdown of spending categories

### Audit & Compliance
- **Complete Audit Trail**: Every action logged with timestamp, user, and details
- **Immutable Logs**: Cannot be modified or deleted
- **Approval Workflow**: Transactions require explicit approval before ledger posting

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Frontend | React + Vite + Tailwind CSS |
| Database | SQLite (upgradeable to PostgreSQL) |
| Charts | Recharts |
| Icons | Lucide React |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to the backend at `localhost:8000`.

## Architecture

```
[ Transaction Input ]
        ↓
[ AI Classification Engine ]  →  confidence score + category
        ↓
[ Human Approval Screen ]     →  approve / reject / override
        ↓
[ Double-Entry Ledger ]       →  deterministic posting
        ↓
[ Financial Reports ]         →  Trial Balance, P&L, Balance Sheet, Cash Flow
        ↓
[ Audit Trail ]               →  immutable log of every action
```

### Design Principles
1. **Ledger is deterministic** — AI suggests, but the ledger uses rules
2. **AI = interpretation layer, Ledger = truth layer**
3. **Human approval required** for all postings
4. **Every action is audited** with before/after state
5. **Separation of suggested vs posted** data

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/accounts/` | List all accounts |
| POST | `/api/accounts/` | Create account |
| GET | `/api/transactions/` | List transactions |
| POST | `/api/transactions/` | Create transaction (AI classifies) |
| POST | `/api/transactions/{id}/approve` | Approve/reject transaction |
| GET | `/api/journal-entries/` | List journal entries |
| GET | `/api/reports/trial-balance` | Trial balance report |
| GET | `/api/reports/income-statement` | Income statement |
| GET | `/api/reports/balance-sheet` | Balance sheet |
| GET | `/api/reports/cash-flow` | Cash flow statement |
| GET | `/api/reports/dashboard` | Dashboard KPIs |
| GET | `/api/reports/ratios` | Financial ratios |
| GET | `/api/audit/` | Audit trail logs |
