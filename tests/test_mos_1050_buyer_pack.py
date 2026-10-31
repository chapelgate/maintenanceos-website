from pathlib import Path


def test_buyer_pack_docs_exist():
    path = Path("docs/commercial_release/BUYER_PACK.md")
    assert path.is_file()


def test_buyer_pack_has_required_sections():
    text = Path("docs/commercial_release/BUYER_PACK.md").read_text()
    lower = text.lower()
    assert "maintenanceos" in lower
    assert "synthetic" in lower
    assert "not a sale" in lower or "not live" in lower
    assert "no live pii" in lower


def test_no_secrets_in_buyer_docs():
    text = Path("docs/commercial_release/BUYER_PACK.md").read_text()
    assert "sk-" not in text
    assert "APP_SECRET" not in text
    assert "Bearer " not in text
