from pathlib import Path

import pytest

import release_manifest
import synthetic_buyer_onboarding_kit as kit


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


def test_synthetic_buyer_tenant_required_fields():
    tenant = kit.synthetic_buyer_tenant()
    assert kit.assert_synthetic_buyer_tenant(tenant) is True
    for key in (
        "mode",
        "client_name",
        "contact_email",
        "contact_phone",
        "property_address",
        "property_postcode",
        "sale_ready",
        "live_pii",
        "synthetic_only",
    ):
        assert key in tenant


def test_synthetic_buyer_tenant_rejects_live_email():
    bad = kit.synthetic_buyer_tenant()
    bad["contact_email"] = "person@example.com"
    with pytest.raises(AssertionError):
        kit.assert_synthetic_buyer_tenant(bad)


def test_populate_demo_buyer_pack_fail_closed():
    pack = kit.populate_demo_buyer_pack()
    assert pack["commercial_release_ready"] is False
    assert pack["tenant"]["sale_ready"] is False
    assert pack["tenant"]["live_pii"] is False
    assert pack["tenant"]["synthetic_only"] is True
    assert pack["kit_present"] is True
    for field in kit.required_step_fields():
        assert field in pack["required_step_fields"]


def test_release_manifest_synthetic_buyer_pack_fields():
    fields = release_manifest.synthetic_buyer_pack_fields()
    assert fields["buyer_pack_synthetic_only"] is True
    assert fields["buyer_pack_sale_ready"] is False
    assert fields["buyer_pack_live_pii"] is False
    assert fields["buyer_pack_kit_present"] is True
    assert fields["buyer_pack_commercial_release_ready"] is False
    assert "checkout_sha" in fields["buyer_pack_required_step_fields"]
    assert "no_live_pii" in fields["buyer_pack_required_step_fields"]
