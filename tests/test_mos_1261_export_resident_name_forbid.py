from export_csv import EXPORT_WORK_ORDER_FIELDS, FORBIDDEN_EXPORT_FIELDS


def test_forbidden_export_includes_resident_name():
    assert "resident_name" in FORBIDDEN_EXPORT_FIELDS


def test_export_allowlist_avoids_resident_name():
    assert "resident_name" not in EXPORT_WORK_ORDER_FIELDS
    assert FORBIDDEN_EXPORT_FIELDS.intersection(EXPORT_WORK_ORDER_FIELDS) == set()
