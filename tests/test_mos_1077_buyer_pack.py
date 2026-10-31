from pathlib import Path

PACK = Path("docs/commercial_release/BUYER_PACK.md")


def test_buyer_pack_docs_exist():
    assert PACK.is_file()


def test_buyer_pack_synthetic_honesty():
    text = PACK.read_text().lower()
    assert "synthetic" in text
    assert "not a sale" in text or "not a live" in text
