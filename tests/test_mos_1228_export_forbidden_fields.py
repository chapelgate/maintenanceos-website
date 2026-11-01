from export_csv import EXPORT_WORK_ORDER_FIELDS, FORBIDDEN_EXPORT_FIELDS


def test_forbidden_export_fields_cover_auth_material():
    required = {
        "session",
        "session_id",
        "csrf",
        "csrf_token",
        "cookie",
        "cookies",
        "bearer",
        "access_token",
        "refresh_token",
    }
    assert required.issubset(FORBIDDEN_EXPORT_FIELDS)


def test_export_allowlist_has_no_forbidden_overlap():
    overlap = FORBIDDEN_EXPORT_FIELDS.intersection(EXPORT_WORK_ORDER_FIELDS)
    assert overlap == set()
