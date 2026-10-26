import os

from decision_engine import classify
import product_profile

_PROFILE_VAR = "PRODUCT_PROFILE"


def _assert_no_voice_imports(source):
    forbidden = ("voice", "telephony", "provider_runtime", "gemini_voice")
    for line in source.splitlines():
        stripped = line.strip()
        if stripped.startswith("import ") or stripped.startswith("from "):
            lowered = stripped.lower()
            for token in forbidden:
                assert token not in lowered, token


def test_both_profiles_classify_office_door_the_same():
    text = "the office door will not close"

    previous = os.environ.get(_PROFILE_VAR)
    try:
        os.environ.pop(_PROFILE_VAR, None)
        maintenance = classify(text)

        os.environ[_PROFILE_VAR] = "worksmartos"
        worksmart = classify(text)
    finally:
        if previous is None:
            os.environ.pop(_PROFILE_VAR, None)
        else:
            os.environ[_PROFILE_VAR] = previous

    expected = {
        "category": "Doors",
        "trade": "Joiner",
        "urgency": "P3",
        "confidence": 0.7,
        "safety_flags": [],
        "human_review_required": False,
    }
    for key, value in expected.items():
        assert maintenance[key] == value, key
        assert worksmart[key] == value, key
    assert maintenance == worksmart


def test_profile_has_no_category_override():
    assert not hasattr(product_profile, "category_override")
    assert not hasattr(product_profile, "category_map")
    assert not hasattr(product_profile, "override_category")


def test_test_file_imports_no_voice_modules():
    import inspect
    import sys
    source = inspect.getsource(sys.modules[__name__])
    _assert_no_voice_imports(source)
