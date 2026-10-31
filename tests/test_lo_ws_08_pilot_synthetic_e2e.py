"""
lo-ws-08-pilot-synthetic-e2e Spec Kit acceptance wrapper.
Named tests run via pytest -k on existing test modules.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_landlord_vertical_pilot_doc_exists():
    path = ROOT / "docs/commercial_release/LANDLORD_VERTICAL_PILOT.md"
    assert path.is_file()
    text = path.read_text()
    assert "No live PII without Andy DPIA/DPA" in text
    assert "synthetic" in text.lower()


# Named acceptance tests executed via:
# pytest tests/test_landlord_vertical_e2e.py::test_synthetic_england_landlord_vertical_e2e
# pytest tests/test_landlord_vertical_rollback.py::test_vertical_off_restores_baseline
