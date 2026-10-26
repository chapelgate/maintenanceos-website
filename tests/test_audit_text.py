import json

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from audit_text import redact_detail
from models import AuditEvent, Base
from operations import audit


def test_email_phone_and_bearer_are_redacted():
    raw = (
        "Contact resident@example.test "
        "+447700900123 "
        "Bearer top-secret-token "
        "sk-abcdefghijklmnop "
        "CA0123456789abcdef0123456789abcdef"
    )
    redacted = redact_detail(raw)
    assert "resident@example.test" not in redacted
    assert "+447700900123" not in redacted
    assert "top-secret-token" not in redacted
    assert "sk-abcdefghijklmnop" not in redacted
    assert "CA0123456789abcdef0123456789abcdef" not in redacted
    assert "[REDACTED]" in redacted
    assert "Bearer [REDACTED]" in redacted


def test_lifecycle_ids_survive():
    raw = json.dumps({
        "client_id": 42,
        "request_id": 17,
        "job_id": 99,
        "hold_id": 7,
        "note": "resident@example.test",
    })
    redacted = redact_detail(raw)
    assert '"client_id": 42' in redacted
    assert '"request_id": 17' in redacted
    assert '"job_id": 99' in redacted
    assert '"hold_id": 7' in redacted
    assert "resident@example.test" not in redacted


def test_audit_helper_stores_redacted_detail():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with factory() as session:
        audit(
            session,
            None,
            "Test",
            "DETAIL_CHECK",
            "resident@example.test Bearer secret sk-abcdefghijklmnop +447700900123",
        )
        session.commit()
        row = session.query(AuditEvent).filter_by(event="DETAIL_CHECK").one()
        assert "resident@example.test" not in row.detail
        assert "secret" not in row.detail
        assert "sk-abcdefghijklmnop" not in row.detail
        assert "+447700900123" not in row.detail
        assert "[REDACTED]" in row.detail
