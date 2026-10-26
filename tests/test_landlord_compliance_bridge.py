import sys
import types

import pytest


class _ImportTracker:
    def __init__(self):
        self.attempts = []

    def find_spec(self, fullname, path, target=None):
        if fullname == "landlordos" or fullname.startswith("landlordos."):
            self.attempts.append(fullname)
        return None


class _BlockLandlordos:
    def __init__(self):
        self.attempts = []

    def find_spec(self, fullname, path, target=None):
        if fullname == "landlordos" or fullname.startswith("landlordos."):
            self.attempts.append(fullname)
            raise ImportError("landlordos not pinned")
        return None


def _reload_bridge():
    for name in list(sys.modules):
        if name == "landlord_compliance_bridge" or name.startswith("landlord_compliance_bridge."):
            del sys.modules[name]
    import landlord_compliance_bridge as bridge
    return bridge


def _clear_landlordos_modules():
    for name in list(sys.modules):
        if name == "landlordos" or name.startswith("landlordos."):
            del sys.modules[name]


def test_vertical_off_does_not_require_landlordos(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)

    tracker = _ImportTracker()
    monkeypatch.setattr(sys, "meta_path", [tracker, *sys.meta_path])

    bridge = _reload_bridge()
    assert bridge.is_landlord_compliance_ready() is False
    assert tracker.attempts == []
    assert bridge.compliance_module() is None


def test_missing_dependency_fails_closed(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    blocker = _BlockLandlordos()
    monkeypatch.setattr(sys, "meta_path", [blocker, *sys.meta_path])

    bridge = _reload_bridge()
    assert bridge.is_landlord() is True
    assert bridge.is_landlord_compliance_ready() is False
    assert blocker.attempts
    assert any(a == "landlordos" or a.startswith("landlordos.") for a in blocker.attempts)


def test_present_compliance_module_returned_without_package_attr(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")

    fake_pkg = types.ModuleType("landlordos")
    fake_mod = types.ModuleType("landlordos.compliance")
    sys.modules["landlordos"] = fake_pkg
    sys.modules["landlordos.compliance"] = fake_mod
    try:
        bridge = _reload_bridge()
        assert bridge.is_landlord_compliance_ready() is True
        assert bridge.compliance_module() is fake_mod
    finally:
        _clear_landlordos_modules()


def test_evaluate_entrypoint_raises_typed_error_when_missing(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    blocker = _BlockLandlordos()
    monkeypatch.setattr(sys, "meta_path", [blocker, *sys.meta_path])

    bridge = _reload_bridge()
    with pytest.raises(bridge.LandlordComplianceError):
        bridge.evaluate_compliance_entrypoint()


def test_synthetic_england_eval_returns_structured_facts(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    captured = {}
    fake_pkg = types.ModuleType("landlordos")
    fake_mod = types.ModuleType("landlordos.compliance")

    def evaluate(ctx):
        captured.update(ctx)
        return {
            "compliant": True,
            "checks": ["gas_safety", "epc"],
            "conclusion": "Serve a section 21 notice",
            "deadline": "2026-12-01",
            "action": "Serve a section 21 notice",
            "recorded_on": "2026-12-01",
            "detail": {
                "note": "Serve a section 21 notice",
                "flag": "present",
                "deadline": "2026-12-01",
            },
        }

    fake_mod.evaluate_compliance = evaluate
    sys.modules["landlordos"] = fake_pkg
    sys.modules["landlordos.compliance"] = fake_mod

    raw_input = {
        "id": "tenancy-123",
        "postcode": "CH1 1AA",
        "property_ref": "PROP-456",
        "special_category": "medical",
        "contact_dump": "john@example.com;07123456789",
        "access_code": "secret123",
    }

    try:
        bridge = _reload_bridge()
        result = bridge.evaluate_compliance(raw_input)
        assert result == {
            "compliant": True,
            "checks": ["gas_safety", "epc"],
            "detail": {"flag": "present"},
        }
        assert "conclusion" not in result
        assert "deadline" not in result
        assert "Serve a section 21 notice" not in repr(result)
        assert "2026-12-01" not in repr(result)
        assert set(captured) == {"id", "postcode", "property_ref"}
        assert raw_input["access_code"] == "secret123"
        assert raw_input["special_category"] == "medical"
    finally:
        _clear_landlordos_modules()


def test_disallowed_fields_are_stripped(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    captured_input = {}

    fake_pkg = types.ModuleType("landlordos")
    fake_mod = types.ModuleType("landlordos.compliance")

    def capture_evaluate_compliance(ctx):
        captured_input.update(ctx)
        return {
            "ok": True,
            "conclusion": "Serve a section 21 notice",
            "deadline": "2026-12-01",
        }

    fake_mod.evaluate_compliance = capture_evaluate_compliance
    sys.modules["landlordos"] = fake_pkg
    sys.modules["landlordos.compliance"] = fake_mod

    try:
        bridge = _reload_bridge()

        raw_input = {
            "id": "tenancy-789",
            "postcode": "SY2 2BB",
            "property_ref": "PROP-789",
            "special_category": "medical_condition",
            "contact_dump": "tenant@example.com;phone",
            "access_code": "door_code_123",
            "ssn": "123-45-6789",
            "medical_record": "private_info",
            "full_name": "John Doe",
            "date_of_birth": "1980-01-01",
            "extra_field": "should_not_appear",
        }

        result = bridge.evaluate_compliance(raw_input)

        assert "special_category" not in captured_input
        assert "contact_dump" not in captured_input
        assert "access_code" not in captured_input
        assert "ssn" not in captured_input
        assert "medical_record" not in captured_input
        assert "full_name" not in captured_input
        assert "date_of_birth" not in captured_input
        assert "extra_field" not in captured_input

        assert set(captured_input.keys()) == {"id", "postcode", "property_ref"}
        assert captured_input["id"] == "tenancy-789"
        assert captured_input["postcode"] == "SY2 2BB"
        assert captured_input["property_ref"] == "PROP-789"

        assert result == {"ok": True}
        assert "Serve a section 21 notice" not in repr(result)
        assert "2026-12-01" not in repr(result)
        assert raw_input["access_code"] == "door_code_123"
        assert raw_input["contact_dump"] == "tenant@example.com;phone"
    finally:
        _clear_landlordos_modules()


def test_evaluate_compliance_raises_when_not_landlord_vertical(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)

    bridge = _reload_bridge()
    with pytest.raises(bridge.LandlordComplianceError, match="not in landlord vertical"):
        bridge.evaluate_compliance({"id": "1", "postcode": "AA1 1AA", "property_ref": "P1"})


def test_evaluate_compliance_raises_when_module_unavailable(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    blocker = _BlockLandlordos()
    monkeypatch.setattr(sys, "meta_path", [blocker, *sys.meta_path])

    bridge = _reload_bridge()
    with pytest.raises(bridge.LandlordComplianceError, match="landlordos.compliance not available"):
        bridge.evaluate_compliance({"id": "1", "postcode": "AA1 1AA", "property_ref": "P1"})


def test_evaluate_compliance_raises_when_result_not_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    _clear_landlordos_modules()

    fake_pkg = types.ModuleType("landlordos")
    fake_mod = types.ModuleType("landlordos.compliance")
    fake_mod.evaluate_compliance = lambda ctx: "not a dict"
    sys.modules["landlordos"] = fake_pkg
    sys.modules["landlordos.compliance"] = fake_mod

    try:
        bridge = _reload_bridge()
        with pytest.raises(bridge.LandlordComplianceError, match="did not return a dict"):
            bridge.evaluate_compliance({"id": "1", "postcode": "AA1 1AA", "property_ref": "P1"})
    finally:
        _clear_landlordos_modules()
