"""Pricing/support model honesty."""

from __future__ import annotations

from pathlib import Path

# The honesty docs are in the current work tree
ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = "/root/jobs-work/readiness-loop/mirrors/chapelgate-multilingual-transcribe"


def test_pricing_is_hypothesis_not_contract():
    pricing = Path(f"{REPO_ROOT}/docs/commercial/PRICING.md").read_text(encoding="utf-8")
    assert "HYPOTHESIS" in pricing
    assert "UNVERIFIED" in pricing
    gate = Path(f"{REPO_ROOT}/docs/RELEASE_GATE.md").read_text(encoding="utf-8")
    assert "Pricing/support model" in gate
    assert "| PARTIAL" in gate
    doc = (ROOT / "docs/ops/PRICING_SUPPORT_HONESTY.md").read_text(encoding="utf-8")
    assert "HYPOTHESIS" in doc
    assert "UNVERIFIED" in doc
    assert "## Do not claim" in doc
    claim = doc.split("## Do not claim", 1)[1].lower()
    assert "contract" in claim or "revenue" in claim
    assert "word-error" in claim or "welsh" in claim