from pathlib import Path

KIT = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md")
REQUIRED = {
    "checkout_sha",
    "readiness_false",
    "local_pytest",
    "synthetic_sqlite_only",
    "no_pstn_call",
    "no_live_pii",
}


def test_synthetic_onboarding_kit_exists():
    assert KIT.is_file()
    text = KIT.read_text(encoding="utf-8")
    assert "SYNTHETIC ONLY" in text
    assert "commercial_release_ready" in text
    assert "NOT A SALE" in text.upper() or "not a sale" in text.lower()


def test_onboarding_steps_have_required_fields():
    text = KIT.read_text(encoding="utf-8")
    assert "required_fields:" in text
    line = next(line for line in text.splitlines() if line.strip().startswith("required_fields:"))
    fields = {part.strip() for part in line.split(":", 1)[1].split(",") if part.strip()}
    assert REQUIRED.issubset(fields)
    lower = text.lower()
    assert "pytest" in lower
    assert "commercial_release_ready" in lower
    assert "pstn" in lower or "golden" in lower
    assert "synthetic" in lower
