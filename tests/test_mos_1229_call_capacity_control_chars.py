from call_capacity import CallLease, ProcessLocalCapacityBackend


def backend():
    b = ProcessLocalCapacityBackend()
    b.set_draining(False)
    return b


def clean_lease(call_sid="sid-1", worker_id="worker-1", call_session_id=1, client_id=1):
    return CallLease(
        lease_id="lease-1", call_sid=call_sid,
        call_session_id=call_session_id, client_id=client_id,
        acquired_at=1.0, worker_id=worker_id,
    )


def test_rejects_control_chars_in_call_sid():
    b = backend()
    ok, reason = b.try_acquire(clean_lease(call_sid="sid\x00"), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"


def test_rejects_control_chars_in_worker_id():
    b = backend()
    ok, reason = b.try_acquire(clean_lease(worker_id="worker\x01"), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"


def test_accepts_clean_lease():
    b = backend()
    ok, reason = b.try_acquire(clean_lease(), global_limit=100, per_client_limit=100)
    assert ok is True and reason == "acquired"
