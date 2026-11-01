from commercial_release_controls import REQUIRED_RETENTION_CLASSES, retention_class_known


def test_known_retention_classes():
    for name in REQUIRED_RETENTION_CLASSES:
        assert retention_class_known(name) is True


def test_unknown_or_invalid_classes():
    assert retention_class_known("") is False
    assert retention_class_known("not_a_class") is False
    assert retention_class_known("audit_minimal\x00") is False
