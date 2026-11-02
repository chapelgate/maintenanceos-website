from call_capacity import CallLease, ProcessLocalCapacityBackend, _has_control_chars


def backend():
    b = ProcessLocalCapacityBackend()
    b.set_draining(False)
    return b


def clean_lease(call_sid="sid-1", worker_id="worker-1", call_session_id=1, client_id=1):
    return CallLease(
        lease_id="lease-1",
        call_sid=call_sid,
        call_session_id=call_session_id,
        client_id=client_id,
        acquired_at=1.0,
        worker_id=worker_id,
    )


def test_helper_rejects_del_and_c1():
    assert _has_control_chars("clean") is False
    assert _has_control_chars("a" + chr(0x7F)) is True
    assert _has_control_chars("a" + chr(0x80)) is True
    assert _has_control_chars("a" + chr(0x9F)) is True
    assert _has_control_chars("a" + chr(0)) is True


def test_try_acquire_rejects_del_and_c1_in_call_sid():
    b = backend()
    ok, reason = b.try_acquire(clean_lease(call_sid="sid" + chr(0x7F)), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"
    ok, reason = b.try_acquire(clean_lease(call_sid="sid" + chr(0x80)), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"


def test_try_acquire_rejects_del_and_c1_in_worker_id():
    b = backend()
    ok, reason = b.try_acquire(clean_lease(worker_id="worker" + chr(0x7F)), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"
    ok, reason = b.try_acquire(clean_lease(worker_id="worker" + chr(0x80)), global_limit=100, per_client_limit=100)
    assert ok is False and reason == "control_char_rejected"
