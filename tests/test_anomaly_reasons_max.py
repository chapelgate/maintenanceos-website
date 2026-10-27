import inspect

import pytest

import operations


def test_anomaly_reasons_max_is_2000():
    assert operations.ANOMALY_REASONS_MAX == 2000


def test_encode_anomaly_reasons_accepts_short_list():
    assert operations.encode_anomaly_reasons(["duplicate_invoice_number"]) == '["duplicate_invoice_number"]'


def test_encode_anomaly_reasons_rejects_overlong():
    reasons = ["x" * (operations.ANOMALY_REASONS_MAX + 1)]
    with pytest.raises(ValueError, match="anomaly_reasons invalid"):
        operations.encode_anomaly_reasons(reasons)


def test_invoice_qa_uses_encode_helper():
    source = inspect.getsource(operations.invoice_qa)
    assert "encode_anomaly_reasons" in source
    assert "ANOMALY_REASONS_MAX" in inspect.getsource(operations)
