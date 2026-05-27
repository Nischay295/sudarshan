from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./sudarshan.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models.accounting import (  # noqa: F401
        Account,
        JournalEntry,
        JournalLine,
        Transaction,
        AuditLog,
        FiscalPeriod,
    )

    Base.metadata.create_all(bind=engine)
