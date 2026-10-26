import inspect

import pytest
from fastapi import HTTPException

import api


def test_evidence_url_max_is_2000():
    assert api.EVIDENCE_URL_MAX == 2000
    source = inspect.getsource(api.complete_submit)
    assert "normalize_evidence_url" in source


def test_evidence_url_accepts_blank_and_https():
    assert api.normalize_evidence_url(None) == ""
    assert api.normalize_evidence_url("") == ""
    assert api.normalize_evidence_url("   ") == ""
    assert (
        api.normalize_evidence_url("  https://evidence.example.com/photo.jpg  ")
        == "https://evidence.example.com/photo.jpg"
    )
    assert (
        api.normalize_evidence_url("https://evidence.example.com/path?x=1")
        == "https://evidence.example.com/path?x=1"
    )


def test_evidence_url_rejects_unsafe_schemes():
    for bad in (
        "http://evidence.example.com/x",
        "javascript:alert(1)",
        "data:text/plain,hi",
        "file:///etc/passwd",
        "https://user:pass@evidence.example.com/x",
        "https://evidence.example.com/x#frag",
        "not-a-url",
        "https://",
        "a" * (api.EVIDENCE_URL_MAX + 1),
    ):
        with pytest.raises(HTTPException) as raised:
            api.normalize_evidence_url(bad)
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api.normalize_evidence_url(123)
    assert typed.value.status_code == 400
