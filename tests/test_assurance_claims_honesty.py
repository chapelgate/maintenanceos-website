from pathlib import Path

import readiness

DOC = Path(__file__).resolve().parents[1] / "docs" / "commercial_release" / "ASSURANCE_CLAIMS_HONESTY.md"


def test_assurance_doc_marks_uk_claims_not_proved():
    text = DOC.read_text(encoding="utf-8")
    assert "NOT PROVED" in text
    assert "WCAG 2.2 AA" in text
    assert "Cyber Essentials" in text
    assert "G-Cloud" in text
    assert "penetration test" in text.lower()


def test_assurance_doc_forbids_sale_and_conformance_claim():
    text = DOC.read_text(encoding="utf-8")
    lower = text.lower()
    assert "NOT A SALE" in text
    assert "commercial_release_ready" in text
    assert "not a conformance claim" in lower or "are not a conformance claim" in lower
    assert "golden phone line" in lower


def test_readiness_stays_closed_with_assurance_doc(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    report = readiness.report()
    assert report["commercial_release_ready"] is False
    assert DOC.is_file()
