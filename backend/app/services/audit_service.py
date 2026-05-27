import json
from sqlalchemy.orm import Session
from app.models.accounting import AuditLog


def log_action(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: int,
    user: str = "system",
    before_state: dict | None = None,
    after_state: dict | None = None,
    details: str | None = None,
) -> AuditLog:
    log = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        user=user,
        before_state=json.dumps(before_state) if before_state else None,
        after_state=json.dumps(after_state) if after_state else None,
        details=details,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
