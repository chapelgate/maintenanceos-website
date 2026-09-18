"""Focused tests for Chapelgate 10-call pilot runtime guard (Lane A)."""

from __future__ import annotations

import os

import pytest

from call_capacity import CapacityRejected, admit_call, reset_capacity_backend_for_tests
from pilot.abort import evaluate_pilot_abort
from pilot.chapelgate_config import OWNER_APPROVAL_RECORDED, chapelgate_pilot_mode_config, pilot_armed
from pilot.runtime_guard import (
    PilotAdmitRejected,
    admit_pilot_call,
    evaluate_signals_and_maybe_abort,
    pilot_status,
    record_pilot_call_completed,
    reset_pilot_runtime_for_tests,
)
from pilot.scorecard import apply_scorecard_event, empty_scorecard


@pytest.fixture(autouse=True)
def _reset(monkeypatch):
    reset_pilot_runtime_for_tests()
    reset_capacity_backend_for_tests()
    monkeypatch.delenv("PILOT_MODE_ARMED", raising=False)
    yield
    reset_pilot_runtime_for_tests()
    reset_capacity_backend_for_tests()
    monkeypatch.delenv("PILOT_MODE_ARMED", raising=False)


def test_owner_approval_recorded_not_armed_until_rg():
    assert OWNER_APPROVAL_RECORDED is True
    assert pilot_armed(owner_approved=True, release_guardian_armed=False) is False
    cfg = chapelgate_pilot_mode_config()
    assert cfg["enabled"] is False
    assert cfg["main_chapelgate_number_change_allowed"] is False
    assert cfg["side_effects"]["healthcare_regulatory_enablement"] is False


def test_passthrough_when_not_armed(monkeypatch):
    monkeypatch.delenv("PILOT_MODE_ARMED", raising=False)
    out = admit_pilot_call(tenant_id="chapelgate", call_sid="CA1")
    assert out["pilot_enforced"] is False
    # Capacity admit still works
    lease = admit_call(call_sid="CA1", call_session_id=1, client_id=1)
    assert lease.call_sid == "CA1"


def test_armed_enforces_limit_and_refuses_call_11(monkeypatch):
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    assert chapelgate_pilot_mode_config()["enabled"] is True
    for i in range(10):
        admit_pilot_call(tenant_id="chapelgate", call_sid=f"CA{i}")
        record_pilot_call_completed(success=True)
    status = pilot_status()
    assert status["calls_completed"] == 10
    assert status["scorecard"]["calls_answered"] == 10
    with pytest.raises(PilotAdmitRejected) as exc:
        admit_pilot_call(tenant_id="chapelgate", call_sid="CA11")
    assert exc.value.reason == "pilot_call_limit_reached"
    with pytest.raises(CapacityRejected):
        admit_call(call_sid="CA11", call_session_id=11, client_id=1, tenant_id="chapelgate")


def test_cross_tenant_refused_when_armed(monkeypatch):
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    with pytest.raises(PilotAdmitRejected) as exc:
        admit_pilot_call(tenant_id="other-tenant", call_sid="CAX")
    assert exc.value.reason == "cross_tenant_leakage"
    st = pilot_status()
    assert st["aborted"] is True


def test_abort_freezes_admits(monkeypatch):
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    evaluate_signals_and_maybe_abort(
        {"tenant_id": "chapelgate", "application_errors": True}
    )
    with pytest.raises(PilotAdmitRejected):
        admit_pilot_call(tenant_id="chapelgate", call_sid="CA-ABORT")


def test_scorecard_increments():
    card = empty_scorecard()
    apply_scorecard_event(card, {"kind": "call_answered", "latency_ms": 120, "cost_usd": 0.02})
    apply_scorecard_event(card, {"kind": "job_captured"})
    row = card.to_dict()
    assert row["calls_answered"] == 1
    assert row["jobs_correctly_captured"] == 1
    assert row["latency_ms"] == 120


def test_abort_conditions_matrix():
    assert evaluate_pilot_abort({"tenant_id": "chapelgate"})["abort"] is False
    assert evaluate_pilot_abort(
        {"tenant_id": "chapelgate", "email_failures_consecutive": 2}
    )["abort"] is True


def test_voice_notification_modules_untouched():
    """Guardrail: voice/email modules must not be modified by this integration."""
    import pathlib
    import subprocess

    root = pathlib.Path(__file__).resolve().parents[1]
    out = subprocess.check_output(
        ["git", "diff", "--name-only", "HEAD", "--", "voice_bridge.py", "gemini_voice.py", "call_notifications.py"],
        cwd=root,
        text=True,
    ).strip()
    assert out == ""


def test_red_team_guard_matrix(monkeypatch):
    """Red Team: arm required, limit hard-stop, abort freeze, tenant isolation, no main-number change."""
    from call_capacity import release_call_lease

    cfg = chapelgate_pilot_mode_config()
    assert cfg["main_chapelgate_number_change_allowed"] is False
    assert cfg["side_effects"]["healthcare_regulatory_enablement"] is False

    # Disarmed: foreign tenant must still pass through (no silent pilot enforcement).
    monkeypatch.delenv("PILOT_MODE_ARMED", raising=False)
    out = admit_pilot_call(tenant_id="other-tenant", call_sid="CA-OPEN")
    assert out["pilot_enforced"] is False

    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    for i in range(10):
        admit_call(call_sid=f"CA-RT-{i}", call_session_id=i + 1, client_id=1, tenant_id="chapelgate")
        release_call_lease(call_sid=f"CA-RT-{i}", call_session_id=i + 1)
    st = pilot_status()
    assert st["calls_completed"] == 10
    assert st["armed"] is True
    assert st["tenant"] == "chapelgate"
    assert st["max_real_calls"] == 10
    with pytest.raises(CapacityRejected):
        admit_call(call_sid="CA-RT-11", call_session_id=99, client_id=1, tenant_id="chapelgate")

    reset_pilot_runtime_for_tests()
    reset_capacity_backend_for_tests()
    evaluate_signals_and_maybe_abort({"tenant_id": "chapelgate", "duplicate_jobs": True})
    with pytest.raises(CapacityRejected):
        admit_call(call_sid="CA-ABORT", call_session_id=1, client_id=1, tenant_id="chapelgate")
