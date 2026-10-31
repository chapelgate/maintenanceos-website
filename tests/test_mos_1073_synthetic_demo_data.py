from pathlib import Path
import seed_synthetic_tenant as seed
from tenant_security import SYNTHETIC_MODE


def test_demo_tenant_has_synthetic_data_only():
    payload = seed.synthetic_seed_strings()
    assert seed.assert_synthetic_markers(payload) is True
    assert payload["mode"] == SYNTHETIC_MODE
    assert "SYNTHETIC" in payload["client_name"]


def test_no_live_pii_in_demo_kit():
    text = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md").read_text().lower()
    assert "synthetic" in text
    assert "not a sale" in text
