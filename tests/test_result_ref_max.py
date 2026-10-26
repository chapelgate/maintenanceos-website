import inspect
from types import SimpleNamespace

import pytest

import idempotency
import operations


def test_result_ref_max_is_200():
    assert idempotency.RESULT_REF_MAX == 200
    source = inspect.getsource(idempotency.set_result_ref)
    assert "RESULT_REF_MAX" in source
    ops = inspect.getsource(operations)
    assert "set_result_ref" in ops


def test_result_ref_accepts_bounded_text():
    receipt = SimpleNamespace(result_ref="")
    idempotency.set_result_ref(receipt, "r" * idempotency.RESULT_REF_MAX)
    assert receipt.result_ref == "r" * idempotency.RESULT_REF_MAX
    idempotency.set_result_ref(receipt, 42)
    assert receipt.result_ref == "42"


def test_result_ref_rejects_overlong():
    receipt = SimpleNamespace(result_ref="")
    with pytest.raises(ValueError, match="Invalid action receipt result_ref"):
        idempotency.set_result_ref(receipt, "r" * (idempotency.RESULT_REF_MAX + 1))
    assert receipt.result_ref == ""
