from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import (
    TransactionCreate, TransactionResponse, TransactionApproval,
)
from app.services.accounting_service import (
    create_transaction, approve_transaction, get_transactions,
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionResponse])
def list_transactions(status: str | None = None, db: Session = Depends(get_db)):
    return get_transactions(db, status)


@router.post("/", response_model=TransactionResponse, status_code=201)
def add_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    try:
        return create_transaction(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{transaction_id}/approve", response_model=TransactionResponse)
def approve_txn(
    transaction_id: int,
    data: TransactionApproval,
    db: Session = Depends(get_db),
):
    try:
        return approve_transaction(
            db, transaction_id, data.approved,
            data.category_override, data.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
