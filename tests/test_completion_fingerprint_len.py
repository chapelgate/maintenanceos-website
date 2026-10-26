import hashlib
import inspect

import pytest

import operations


def test_completion_fingerprint_len_is_64():
    assert operations.COMPLETION_FINGERPRINT_LEN == 64
    source = inspect.getsource(operations.submit_completion)
    assert "completion_evidence_fingerprint" in source


def test_completion_fingerprint_is_sha256_hex():
    note = "boiler isolated and repaired"
    url = "https://evidence.example/proof"
    expected = hashlib.sha256(url.encode()).hexdigest()
    got = operations.completion_evidence_fingerprint(note, url)
    assert got == expected
    assert len(got) == 64
    assert got == got.lower()
    assert all(c in "0123456789abcdef" for c in got)
    assert operations.completion_evidence_fingerprint(note, "") == hashlib.sha256(note.encode()).hexdigest()


def test_completion_fingerprint_rejects_non_hex_length(monkeypatch):
    def bad_digest(data):
        class Bad:
            def hexdigest(self):
                return "abc"
        return Bad()
    monkeypatch.setattr(operations.hashlib, "sha256", bad_digest)
    with pytest.raises(ValueError):
        operations.completion_evidence_fingerprint("note", "")
