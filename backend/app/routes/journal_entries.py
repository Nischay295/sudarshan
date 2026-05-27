from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import JournalEntryCreate, JournalEntryResponse, JournalLineResponse
from app.services.accounting_service import (
    create_journal_entry, get_journal_entries,
    approve_journal_entry, post_journal_entry,
)

router = APIRouter(prefix="/api/journal-entries", tags=["journal_entries"])


def _entry_to_response(entry) -> JournalEntryResponse:
    lines = []
    for line in entry.lines:
        lines.append(JournalLineResponse(
            id=line.id,
            account_id=line.account_id,
            account_name=line.account.name if line.account else None,
            account_code=line.account.code if line.account else None,
            debit=line.debit,
            credit=line.credit,
            description=line.description,
        ))

    return JournalEntryResponse(
        id=entry.id,
        entry_number=entry.entry_number,
        date=entry.date,
        description=entry.description,
        reference=entry.reference,
        status=entry.status.value if hasattr(entry.status, "value") else entry.status,
        total_debit=entry.total_debit,
        total_credit=entry.total_credit,
        created_by=entry.created_by,
        approved_by=entry.approved_by,
        created_at=entry.created_at,
        posted_at=entry.posted_at,
        lines=lines,
    )


@router.get("/", response_model=list[JournalEntryResponse])
def list_journal_entries(status: str | None = None, db: Session = Depends(get_db)):
    entries = get_journal_entries(db, status)
    return [_entry_to_response(e) for e in entries]


@router.post("/", response_model=JournalEntryResponse, status_code=201)
def add_journal_entry(data: JournalEntryCreate, db: Session = Depends(get_db)):
    try:
        entry = create_journal_entry(db, data)
        return _entry_to_response(entry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{entry_id}/approve", response_model=JournalEntryResponse)
def approve_entry(entry_id: int, db: Session = Depends(get_db)):
    try:
        entry = approve_journal_entry(db, entry_id)
        return _entry_to_response(entry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{entry_id}/post", response_model=JournalEntryResponse)
def post_entry(entry_id: int, db: Session = Depends(get_db)):
    try:
        entry = post_journal_entry(db, entry_id)
        return _entry_to_response(entry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
