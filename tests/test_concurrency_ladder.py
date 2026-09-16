import json
import os
import time

import pytest

from call_capacity import (
    CapacityRejected,
    admit_call,
    capacity_snapshot,
    expire_stale_leases,
    global_max_concurrent_calls,
    release_call_lease,
    reset_capacity_backend_for_tests,
    set_capacity_draining,
)
from concurrency_loadtest import LADDER, run_ladder, run_level
from telephony_path_concurrency_probe import run_telephony_path_probe


@pytest.fixture(autouse=True)
def _reset_capacity(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    monkeypatch.setenv("PER_CLIENT_MAX_CONCURRENT_CALLS", "100")
    reset_capacity_backend_for_tests()
    yield
    reset_capacity_backend_for_tests()


def test_capacity_rejects_beyond_global_limit(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "3")
    reset_capacity_backend_for_tests()
    leases = []
    for i in range(3):
        leases.append(admit_call(call_sid=f"CA-{i}", call_session_id=i + 1, client_id=1))
    with pytest.raises(CapacityRejected) as exc:
        admit_call(call_sid="CA-overflow", call_session_id=99, client_id=1)
    assert exc.value.reason == "global_capacity"
    for lease in leases:
        release_call_lease(lease)
    assert capacity_snapshot().active_calls == 0


def test_capacity_enforces_per_client_limit(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "50")
    monkeypatch.setenv("PER_CLIENT_MAX_CONCURRENT_CALLS", "2")
    reset_capacity_backend_for_tests()
    admit_call(call_sid="CA-a1", call_session_id=1, client_id=7)
    admit_call(call_sid="CA-a2", call_session_id=2, client_id=7)
    with pytest.raises(CapacityRejected) as exc:
        admit_call(call_sid="CA-a3", call_session_id=3, client_id=7)
    assert exc.value.reason == "client_capacity"
    # Other company still admitted
    admit_call(call_sid="CA-b1", call_session_id=4, client_id=8)
    assert capacity_snapshot().active_calls == 3


def test_capacity_idempotent_for_same_call():
    first = admit_call(call_sid="CA-same", call_session_id=10, client_id=1)
    second = admit_call(call_sid="CA-same", call_session_id=10, client_id=1)
    assert capacity_snapshot().active_calls == 1
    release_call_lease(first)
    # second may be same or replaced; ensure clean release by sid
    release_call_lease(call_sid="CA-same", call_session_id=10)
    assert capacity_snapshot().active_calls == 0


def test_drain_rejects_new_calls_without_touching_active():
    active = admit_call(call_sid="CA-live", call_session_id=1, client_id=1)
    set_capacity_draining(True)
    with pytest.raises(CapacityRejected) as exc:
        admit_call(call_sid="CA-new", call_session_id=2, client_id=1)
    assert exc.value.reason == "draining"
    assert capacity_snapshot().active_calls == 1
    assert capacity_snapshot().draining is True
    release_call_lease(active)
    assert capacity_snapshot().active_calls == 0


def test_stale_lease_expiry_does_not_corrupt_live_calls():
    live = admit_call(call_sid="CA-alive", call_session_id=1, client_id=1)
    dead = admit_call(call_sid="CA-dead", call_session_id=2, client_id=1)
    dead.acquired_at = time.monotonic() - 10_000
    removed = expire_stale_leases(max_age_seconds=60)
    assert removed == 1
    snap = capacity_snapshot()
    assert snap.active_calls == 1
    release_call_lease(live)
    assert capacity_snapshot().active_calls == 0


def test_concurrency_ladder_to_100(tmp_path, monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    monkeypatch.setenv("PER_CLIENT_MAX_CONCURRENT_CALLS", "100")
    # Keep hold short for CI speed while barrier forces full overlap of leases.
    reports = run_ladder(hold_seconds=0.05)
    assert [r.target for r in reports] == list(LADDER)
    for report in reports:
        assert report.pass_gate, (
            f"level {report.target} failed bottleneck={report.bottleneck} "
            f"accepted={report.accepted} peak={report.active_calls_peak} "
            f"errors={report.errors} cross={report.cross_leak_detected} "
            f"recovery={report.recovery_ok}"
        )
        assert report.active_calls_peak >= report.target
        assert report.unique_call_ids == report.target
        assert report.unique_session_ids == report.target
        assert report.unique_transcripts == report.target
        assert report.cross_leak_detected is False
        assert report.recovery_ok is True
        assert report.duplicate_actions == 0
        assert report.webhook_retries == report.target
    final = reports[-1]
    assert final.target == 100
    assert final.accepted == 100
    assert final.bottleneck_class == "provider_quota_next"
    evidence = tmp_path / "ladder.json"
    evidence.write_text(json.dumps([report.__dict__ for report in reports], default=str))
    assert evidence.exists()


def test_telephony_path_probe_twelve(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    report = run_telephony_path_probe(12)
    assert report.pass_gate, (
        f"path probe failed accepted={report.accepted} peak={report.peak_active} "
        f"errors={report.errors} class={report.bottleneck_class}"
    )
    assert report.unique_call_ids == 12
    assert report.unique_session_ids == 12


def test_cost_budget_kill_switch_rejects_new_admits(monkeypatch):
    monkeypatch.setenv("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    monkeypatch.setenv("EST_COST_PER_CALL_HOUR_USD", "10")
    monkeypatch.setenv("CAPACITY_MAX_HOURLY_BURN_USD", "15")
    reset_capacity_backend_for_tests()
    admit_call(call_sid="CA-budget-1", call_session_id=1, client_id=1)
    with pytest.raises(CapacityRejected) as exc:
        admit_call(call_sid="CA-budget-2", call_session_id=2, client_id=1)
    assert exc.value.reason == "cost_budget"
