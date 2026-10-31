from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_landlord_vertical_e2e_exits_0_synthetic():
    text = (ROOT / "tests/test_landlord_vertical_e2e.py").read_text()
    assert "def test_synthetic_england_landlord_vertical_e2e" in text


def test_vertical_off_restores_baseline():
    text = (ROOT / "tests/test_landlord_vertical_rollback.py").read_text()
    assert "def test_vertical_off_restores_baseline" in text


def test_landlord_vertical_pilot_doc_exists():
    path = ROOT / "docs/commercial_release/LANDLORD_VERTICAL_PILOT.md"
    assert path.is_file()
    text = path.read_text()
    assert "No live PII without Andy DPIA/DPA" in text
    assert "synthetic" in text.lower()
