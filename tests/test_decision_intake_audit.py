import pytest

import decision_engine


def test_intake_audit_detail_max_is_8000():
    assert decision_engine.INTAKE_AUDIT_DETAIL_MAX == 8000
    assert decision_engine.INTAKE_AUDIT_ACTOR_MAX == 100


def test_bound_intake_audit_detail_accepts_small_payload():
    detail = decision_engine.bound_intake_audit_detail(
        {"category": "Plumbing", "trade": "Plumber", "confidence": 0.9}
    )
    assert '"category": "Plumbing"' in detail
    assert '"trade": "Plumber"' in detail


def test_bound_intake_audit_detail_rejects_overlong_payload():
    with pytest.raises(ValueError, match="intake audit detail invalid"):
        decision_engine.bound_intake_audit_detail(
            {"blob": "x" * (decision_engine.INTAKE_AUDIT_DETAIL_MAX + 1)}
        )


def test_bound_intake_audit_detail_redacts_secrets():
    detail = decision_engine.bound_intake_audit_detail(
        {
            "category": "Unknown",
            "note": "contact resident@example.com Bearer tokensecretvalue phone +441512345678",
        }
    )
    assert "resident@example.com" not in detail
    assert "+441512345678" not in detail
    assert "Bearer [REDACTED]" in detail
    assert "[REDACTED]" in detail
