import os
from unittest import mock

import vertical_profile


def test_get_env_rejects_control_chars(monkeypatch):
    monkeypatch.setattr(vertical_profile.os, 'getenv', lambda key, default="": "good\x00value")
    assert vertical_profile._get_env("WORKSMART_TEST_KEY") == ""


def test_get_env_accepts_clean(monkeypatch):
    monkeypatch.setattr(vertical_profile.os, 'getenv', lambda key, default="": "good value")
    assert vertical_profile._get_env("WORKSMART_TEST_KEY") == "good value"


def test_get_env_handles_os_getenv_valueerror(monkeypatch):
    monkeypatch.setattr(vertical_profile.os, 'getenv', lambda key, default="": (_ for _ in ()).throw(ValueError("embedded null byte")))
    assert vertical_profile._get_env("WORKSMART_TEST_KEY") == ""


def test_overlay_keys_include_frozen_surfaces():
    for key in ("WORKSMART_DEPLOY", "WORKSMART_NGINX", "WORKSMART_GOLDEN_LINE", "WORKSMART_SECRET", "WORKSMART_PRODUCTION"):
        assert key in vertical_profile.OVERLAY_KEYS


def test_is_landlord_still_works():
    assert vertical_profile.is_landlord() in (True, False)
    assert vertical_profile.is_worksmartos() in (True, False)
    assert vertical_profile.get_vertical() in ("none", "landlord")
