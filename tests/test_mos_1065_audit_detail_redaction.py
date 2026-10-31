import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from audit_text import redact_detail
from http_error_text import sanitize_http_detail
from models import AuditEvent, Base, Client, Property, WorkOrder
import operations


def test_audit_detail_redacts_secrets():
    text = redact_detail("Bearer top-secret sk-abcdefghijklmnop user@example.com +447700900123")
    assert "top-secret" not in text
    assert "sk-abcdefghijklmnop" not in text
    assert "user@example.com" not in text
    assert "+447700900123" not in text
    assert "[REDACTED]" in text


def test_audit_detail_no_raw_tokens():
    sample = "ghp_" + ("A" * 36) + " gho_" + ("B" * 36)
    out = redact_detail(sample)
    assert "ghp_" not in out
    assert "gho_" not in out


def test_operations_detail_write_is_redacted():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with Session() as s:
        client = Client(name="Pilot")
        s.add(client)
        s.flush()
        prop = Property(client_id=client.id, address="x", postcode="SW1A 1AA")
        s.add(prop)
        s.flush()
        wo = WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            description="leak",
            category="Plumbing",
            trade="Plumber",
            urgency="P3",
            status="NEW",
            safety_flags="[]",
            ai_confidence=0.5,
        )
        s.add(wo)
        s.flush()
        operations.audit(s, wo.id, "tester", "UNIT_TEST", "Bearer leakytoken sk-abcdefghijklmnop")
        s.commit()
        detail = s.query(AuditEvent).filter_by(work_order_id=wo.id).one().detail
    assert "leakytoken" not in detail
    assert "sk-abcdefghijklmnop" not in detail
    assert "[REDACTED]" in detail


def test_http_error_detail_redaction():
    out = sanitize_http_detail("fail Bearer abcdefgh token@example.com")
    assert "abcdefgh" not in out
    assert "token@example.com" not in out


def test_audit_detail_rejects_invalid_input():
    with pytest.raises(ValueError):
        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Session = sessionmaker(bind=engine, expire_on_commit=False)
        Base.metadata.create_all(engine)
        with Session() as s:
            operations.audit(s, 1, "", "EVENT", "x")


def test_audit_detail_handles_empty_string():
    assert redact_detail("") == ""
    assert redact_detail(None) == ""


def test_no_duplicate_audit_regex_constants():
    text = open("audit_text.py").read()
    assert "from secret_patterns import" in text
    assert "BEARER_VALUE = re.compile" not in text


def test_redact_detail_returns_redacted_output():
    assert "[REDACTED]" in redact_detail("email me at a@b.co")


def test_audit_detail_preserves_safe_fields():
    # lifecycle-ish ids should survive when not secret-shaped
    text = redact_detail("work_order_id=123 status=CLOSED")
    assert "work_order_id=123" in text
    assert "status=CLOSED" in text
