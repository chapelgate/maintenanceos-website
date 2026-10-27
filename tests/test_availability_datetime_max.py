from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi import HTTPException

import api


def test_availability_datetime_text_max_constant():
    assert api.AVAILABILITY_DATETIME_TEXT_MAX == 32


def test_valid_datetime_format_within_max():
    sample = "2099-01-02 15:30"
    assert len(sample) == 16
    assert len(sample) <= api.AVAILABILITY_DATETIME_TEXT_MAX


def test_availability_submit_rejects_overlong_start(monkeypatch):
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    overlong = "2" * (api.AVAILABILITY_DATETIME_TEXT_MAX + 1)
    with patch.object(api, "verify_link", return_value=True):
        with patch.object(api, "_require_contractor_token", side_effect=lambda t: t):
            with pytest.raises(HTTPException) as exc:
                api.availability_submit(1, 2, "token", overlong, "2099-01-02 15:30")
    assert exc.value.status_code == 400
    assert "start" in exc.value.detail and "too long" in exc.value.detail


def test_availability_submit_rejects_overlong_end(monkeypatch):
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    overlong = "2" * (api.AVAILABILITY_DATETIME_TEXT_MAX + 1)
    with patch.object(api, "verify_link", return_value=True):
        with patch.object(api, "_require_contractor_token", side_effect=lambda t: t):
            with pytest.raises(HTTPException) as exc:
                api.availability_submit(1, 2, "token", "2099-01-02 15:30", overlong)
    assert exc.value.status_code == 400
    assert "end" in exc.value.detail and "too long" in exc.value.detail


def test_api_wires_datetime_bounds():
    source = (Path(__file__).resolve().parents[1] / "api.py").read_text(encoding="utf-8")
    assert "AVAILABILITY_DATETIME_TEXT_MAX" in source
    assert "start is too long" in source
    assert "end is too long" in source
