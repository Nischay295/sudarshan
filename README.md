# Sudarshan

Sudarshan is a local-first AI-assisted commerce MVP for Indian accountants and SMBs. It starts with a deterministic accounting core: manual/source transaction entry, rule-assisted classification, automatic double-entry posting after validation, ledger reports, GST summaries, and management-style AI explanations.

## Workspace

- `apps/api` - FastAPI backend, SQLAlchemy models, accounting services, reports, and tests.
- `apps/web` - Next.js accountant workspace UI.
- `docs` - Architecture, API, and roadmap notes.
- `docker-compose.yml` - Local PostgreSQL service for production-like development.

## Local Setup

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r apps/api/requirements.txt
npm install
```

Optional PostgreSQL:

```powershell
docker compose up -d postgres
$env:DATABASE_URL="postgresql+psycopg://sudarshan:sudarshan@localhost:5432/sudarshan"
```

If `DATABASE_URL` is not set, the API falls back to local SQLite for quick development.

## Run

Terminal 1:

```powershell
.\.venv\Scripts\python -m uvicorn sudarshan.main:app --app-dir apps/api --reload
```

Terminal 2:

```powershell
npm run dev:web
```

Open `http://localhost:3000`.

## Verify

```powershell
.\.venv\Scripts\python -m pytest apps/api/tests
npm run build:web
```

