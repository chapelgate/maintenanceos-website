import commercial_release_controls as crc
import lifecycle_runtime as lr


def test_lifecycle_runtime_flag_stays_false():
    assert crc.data_lifecycle_runtime_ready() is False


def test_three_required_classes_have_no_runtime():
    required_unsupported = ("contractor_profile", "user_account", "backup_copy")
    for name in required_unsupported:
        assert name in crc.REQUIRED_RETENTION_CLASSES
        assert name not in lr.SUPPORTED_RUNTIME_CLASSES


def test_unsupported_class_raises():
    class _FakeSession:
        def query(self, *args, **kwargs):
            raise AssertionError("_records_for_class should raise before querying")

    session = _FakeSession()
    for name in ("contractor_profile", "user_account", "backup_copy"):
        try:
            lr._records_for_class(session, 1, name)
        except lr.LifecycleRuntimeError as exc:
            assert f"runtime_class_not_supported:{name}" in str(exc)
        else:
            raise AssertionError(f"expected LifecycleRuntimeError for {name}")


def test_retention_policy_still_has_no_defaults(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    assert crc.retention_policy() is None
    assert crc.retention_policy_configured() is False
    monkeypatch.setenv("DATA_RETENTION_POLICY_JSON", "")
    assert crc.retention_policy() is None
    assert crc.retention_policy_configured() is False
