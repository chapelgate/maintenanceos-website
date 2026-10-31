from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_no_landlordos_vendored_in_mos():
    hits = list(ROOT.rglob("landlordos/**/*.py"))
    vendored = [p for p in hits if "specs" not in p.parts and "tests" not in p.parts and ".git" not in p.parts]
    assert vendored == [], f"landlordos vendored in MOS: {vendored}"


def test_landlord_docs_exist():
    assert (ROOT / "docs/commercial_release/LANDLORD_VERTICAL_ONBOARDING.md").is_file()
    assert (ROOT / "docs/commercial_release/LANDLORD_VERTICAL_PILOT.md").is_file()
