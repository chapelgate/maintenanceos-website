import pytest
from unittest.mock import MagicMock

import idempotency as ide


def test_set_result_ref_rejects_control_chars():
    receipt = MagicMock()
    with pytest.raises(ValueError, match="control"):
        ide.set_result_ref(receipt, "result\x00value")


def test_set_result_ref_accepts_clean():
    receipt = MagicMock()
    ide.set_result_ref(receipt, "success-123")
    assert receipt.result_ref == "success-123"
