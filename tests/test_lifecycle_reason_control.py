import pytest

import operations


@pytest.mark.parametrize("fn,args", [
    (operations.cancel_work_order, (1,1,"reason\x00here")),
    (operations.reject_operational_action, (1,1,"reason\x00here")),
    (operations.reopen_work_order, (1,1,"reason\x00here")),
    (operations.record_no_show, (1,1,"reason\x00here")),
])
def test_lifecycle_reasons_fail_closed_on_control_chars(fn,args):
    assert fn(*args) is False


def test_lifecycle_reason_rejects_disallowed_control_chars():
    assert operations.reason_has_control_chars("reason\x00here")
    assert not operations.reason_has_control_chars("reason\nok")
