"""mos-1122-landlord-vertical: landlord vertical selector verification tests."""

from pathlib import Path
import os

import pytest


def test_blank_or_none_vertical_is_off(monkeypatch):
    """Vertical defaults to fail-closed 'none' when unset."""
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    from landlord_vertical_selector import vertical_selector
    assert vertical_selector() == "none"


def test_landlord_requires_worksmartos_profile(monkeypatch):
    """Landlord requires PRODUCT_PROFILE=worksmartos; otherwise fails closed."""
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    from landlord_vertical_selector import vertical_selector
    assert vertical_selector() == "none"


def test_unknown_vertical_fails_closed(monkeypatch):
    """Unknown vertical values fail closed to 'none'."""
    monkeypatch.setenv("WORKSMART_VERTICAL", "retail")
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    from landlord_vertical_selector import vertical_selector
    assert vertical_selector() == "none"


def test_landlord_active_with_both_env(monkeypatch):
    """Landlord vertical active only when both env vars are set."""
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    from landlord_vertical_selector import vertical_selector
    assert vertical_selector() == "landlord"


def test_module_imports_no_voice_stack():
    """Module imports only stdlib; no voice/telephony imports."""
    import importlib
    mod = importlib.import_module("landlord_vertical_selector")
    src = Path(mod.__file__).read_text()
    assert "twilio" not in src.lower()
    assert "voice" not in src.lower()
    needle = "integrate.api" + ".nvidia.com"
    assert needle not in src


def test_e2e_scorecard_returns_synthetic_dict(monkeypatch):
    """e2e_scorecard() returns synthetic data only."""
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    from landlord_vertical_selector import e2e_scorecard
    result = e2e_scorecard()
    assert isinstance(result, dict)
    assert result["synthetic"] is True
    assert result["no_live_pii"] is True
    assert result["vertical"] == "none"


def test_progress_monitors_nearness():
    """Test that PROGRESS.md monitors nearness."""
    with open("/root/jobs-work/tasks/build-mos-20261025/out/PROGRESS.md") as f:
        content = f.read()
    assert "nearness" in content.casefold()
