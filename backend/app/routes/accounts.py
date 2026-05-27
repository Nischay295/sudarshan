from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import AccountCreate, AccountResponse, AccountUpdate
from app.services.accounting_service import create_account, get_accounts
from app.models.accounting import Account

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("/", response_model=list[AccountResponse])
def list_accounts(active_only: bool = True, db: Session = Depends(get_db)):
    return get_accounts(db, active_only)


@router.post("/", response_model=AccountResponse, status_code=201)
def add_account(data: AccountCreate, db: Session = Depends(get_db)):
    try:
        return create_account(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.patch("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, data: AccountUpdate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if data.name is not None:
        account.name = data.name
    if data.description is not None:
        account.description = data.description
    if data.is_active is not None:
        account.is_active = data.is_active

    db.commit()
    db.refresh(account)
    return account
