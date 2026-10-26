import sys
import warnings


def test_blank_or_none_vertical_is_off(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)

    if "vertical_profile" in sys.modules:
        del sys.modules["vertical_profile"]
    from vertical_profile import get_vertical

    assert get_vertical() == "none"


def test_landlord_requires_worksmartos_profile(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "maintenanceos")

    if "vertical_profile" in sys.modules:
        del sys.modules["vertical_profile"]
    from vertical_profile import get_vertical

    assert get_vertical() == "none"

    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")

    if "vertical_profile" in sys.modules:
        del sys.modules["vertical_profile"]
    from vertical_profile import get_vertical

    assert get_vertical() == "landlord"


def test_unknown_vertical_fails_closed(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "unknown_vertical")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")

    if "vertical_profile" in sys.modules:
        del sys.modules["vertical_profile"]
    from vertical_profile import get_vertical

    assert get_vertical() == "none"


def test_overlay_keys_rejected(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    overlay_keys = [
        "WORKSMART_RETENTION",
        "WORKSMART_VOICE",
        "WORKSMART_TELEPHONY",
        "WORKSMART_MARKET",
        "WORKSMART_DISPATCH",
        "WORKSMART_CREDENTIALS",
    ]

    for key in overlay_keys:
        monkeypatch.setenv(key, "some_value")

    if "vertical_profile" in sys.modules:
        del sys.modules["vertical_profile"]
    from vertical_profile import get_vertical, OVERLAY_KEYS

    for key in overlay_keys:
        assert key in OVERLAY_KEYS

    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        assert get_vertical() == "landlord"
        assert len(w) == len(overlay_keys)
        for warning in w:
            assert issubclass(warning.category, RuntimeWarning)
            assert "is set but ignored" in str(warning.message)


def test_module_imports_no_voice_stack():
    import vertical_profile
    import inspect

    source = inspect.getsource(vertical_profile)
    forbidden_imports = [
        "gemini_voice",
        "voice_bridge",
        "voice_policy",
        "provider_runtime",
        "google.genai",
        "apscheduler",
        "twilio",
    ]

    for forbidden in forbidden_imports:
        assert f"import {forbidden}" not in source, f"Forbidden import in source: {forbidden}"
        assert f"from {forbidden}" not in source, f"Forbidden from import in source: {forbidden}"

    import_lines = [line.strip() for line in source.split("\n")
                    if line.strip().startswith(("import ", "from "))]
    allowed = {"os", "warnings"}
    for line in import_lines:
        parts = line.split()
        if parts[0] == "import":
            mod = parts[1].split(".")[0]
            assert mod in allowed, f"Disallowed import: {mod}"
        elif parts[0] == "from":
            mod = parts[1].split(".")[0]
            assert mod in allowed, f"Disallowed from-import: {mod}"