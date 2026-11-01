from pathlib import Path

import synthetic_buyer_onboarding_kit as kit


def test_required_step_fields_include_no_golden_line():
    assert "no_golden_line" in kit.required_step_fields()
    assert "no_pstn_call" in kit.required_step_fields()


def test_kit_doc_documents_no_golden_line():
    text = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md").read_text(encoding="utf-8")
    assert "no_golden_line" in text
    assert "golden phone line" in text.lower()


def test_populate_demo_buyer_pack_exposes_field():
    pack = kit.populate_demo_buyer_pack()
    assert "no_golden_line" in pack["required_step_fields"]
    assert pack["commercial_release_ready"] is False
