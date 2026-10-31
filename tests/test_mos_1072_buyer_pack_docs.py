"""mos-1072-buyer-pack-docs: buyer pack documentation validation."""

import pathlib

import pytest

BUYER_PACK = pathlib.Path("docs/commercial_release/BUYER_PACK.md")
ACCESSIBILITY_DOC = pathlib.Path("docs/commercial_release/ACCESSIBILITY_WCAG_2_2_AA.md")


class TestBuyerPack:
    """Buyer pack docs exist and are complete with required sections."""

    def test_buyer_pack_exists(self):
        assert BUYER_PACK.is_file()

    def test_buyer_pack_has_required_sections(self):
        text = BUYER_PACK.read_text(encoding="utf-8")
        for section in (
            "What this pack covers",
            "What this pack is not",
            "Honesty locks",
            "commercial_release_ready",
        ):
            assert section in text, f"missing section: {section}"

    def test_accessibility_doc_exists(self):
        assert ACCESSIBILITY_DOC.is_file()

    def test_accessibility_doc_has_wcag_criteria(self):
        text = ACCESSIBILITY_DOC.read_text(encoding="utf-8")
        assert "WCAG 2.2 AA" in text
        assert "Bypass Blocks" in text
        assert "Skip to main content" in text or "skip-to-main" in text.lower() or "Skip-to-main" in text

    def test_no_secrets_in_buyer_docs(self):
        import re

        for doc in (BUYER_PACK, ACCESSIBILITY_DOC):
            content = doc.read_text(encoding="utf-8")
            secret_patterns = [
                r"AKIA[0-9A-Z]{16}",
                r"ghp_[0-9a-zA-Z]{36}",
                r"password\s*=\s*\S+",
                r"secret\s*=\s*\S+",
            ]
            for pattern in secret_patterns:
                assert not re.search(pattern, content, re.IGNORECASE), f"secret found in {doc.name}"

    def test_buyer_pack_states_synthetic_only(self):
        text = BUYER_PACK.read_text(encoding="utf-8").lower()
        assert "synthetic" in text
        assert "not a sale" in text
