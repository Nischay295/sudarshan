from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schemas import AuditLogResponse
from app.models.accounting import AuditLog

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    entity_type: str | None = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    return list(query.order_by(AuditLog.timestamp.desc()).limit(limit).all())
