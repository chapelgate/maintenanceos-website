import inspect

import channels
import operations
import worker


def test_operations_reexports_approval_reason_max():
    assert operations.APPROVAL_REASON_MAX == 1000


def test_operations_approval_create_sites_use_helper():
    source = inspect.getsource(operations)
    assert source.count("bounded_approval_reason(") >= 5


def test_channels_and_worker_approval_create_sites_use_helper():
    assert "bounded_approval_reason(" in inspect.getsource(channels)
    assert "bounded_approval_reason(" in inspect.getsource(worker)
