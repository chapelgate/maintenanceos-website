import importlib
import sys
import types

import landlord_rent_bridge


def _reload():
    return importlib.reload(landlord_rent_bridge)


def _clear_landlordos():
    for name in list(sys.modules):
        if name == "landlordos" or name.startswith("landlordos."):
            del sys.modules[name]


def test_flag_default_off(monkeypatch):
    monkeypatch.delenv("RENT_LEDGER_ENABLE", raising=False)
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    bridge = _reload()
    assert bridge.rent_ledger_evaluation() is False


def test_synthetic_ledger_eval(monkeypatch):
    monkeypatch.setenv("RENT_LEDGER_ENABLE", "true")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    bridge = _reload()
    result = bridge.rent_ledger_evaluation(
        charges=[{"amount": 1000}, {"amount": 500}],
        transactions=[{"amount": 700}],
    )
    assert result["read_only"] is True
    assert result["arrears"] == 800
    assert result["total_charged"] == 1500
    assert result["total_paid"] == 700
    assert result["is_payment_execution"] is False
    assert result["source"] == "synthetic_arithmetic"


def test_synthetic_ledger_uses_landlordos_rent_ledger(monkeypatch):
    monkeypatch.setenv("RENT_LEDGER_ENABLE", "true")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    _clear_landlordos()

    class _Result:
        balance = 600
        expected_rent = 1000
        received_rent = 400
        is_payment_execution = False

    calls = {}

    def evaluate_rent_ledger(**kwargs):
        calls["kwargs"] = kwargs
        return _Result()

    fake_pkg = types.ModuleType("landlordos")
    fake_mod = types.ModuleType("landlordos.rent_ledger")
    fake_mod.evaluate_rent_ledger = evaluate_rent_ledger
    sys.modules["landlordos"] = fake_pkg
    sys.modules["landlordos.rent_ledger"] = fake_mod
    try:
        bridge = _reload()
        result = bridge.rent_ledger_evaluation(
            charges=[
                {
                    "rent_charge_id": "c1",
                    "tenancy_id": "ten-synth-1",
                    "charge_date": "2026-01-01",
                    "period_start_date": "2026-01-01",
                    "period_end_date": "2026-01-31",
                    "amount": "1000.00",
                }
            ],
            transactions=[
                {
                    "rent_transaction_id": "t1",
                    "tenancy_id": "ten-synth-1",
                    "transaction_date": "2026-01-05",
                    "amount": "400.00",
                }
            ],
        )
        assert result["source"] == "landlordos.rent_ledger"
        assert result["read_only"] is True
        assert result["is_payment_execution"] is False
        assert result["total_charged"] == 1000
        assert result["total_paid"] == 400
        assert result["arrears"] == 600
        assert calls["kwargs"]["tenancy_id"] == "ten-synth-1"
    finally:
        _clear_landlordos()


def test_missing_landlordos_fails_closed_for_library_records(monkeypatch):
    monkeypatch.setenv("RENT_LEDGER_ENABLE", "true")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    _clear_landlordos()

    class _Block:
        def find_spec(self, fullname, path, target=None):
            if fullname == "landlordos" or fullname.startswith("landlordos."):
                raise ImportError("landlordos not pinned")
            return None

    blocker = _Block()
    sys.meta_path.insert(0, blocker)
    try:
        bridge = _reload()
        result = bridge.rent_ledger_evaluation(
            charges=[
                {
                    "rent_charge_id": "c1",
                    "tenancy_id": "ten-synth-1",
                    "charge_date": "2026-01-01",
                    "period_start_date": "2026-01-01",
                    "period_end_date": "2026-01-31",
                    "amount": "1000.00",
                }
            ],
            transactions=[],
        )
        assert result is False
    finally:
        sys.meta_path.remove(blocker)
        _clear_landlordos()


def test_no_payment_gateway_or_bank_write():
    forbidden = {"stripe", "paypal", "razorpay", "square", "bank", "payment_gateway"}
    before = set(sys.modules)
    importlib.reload(landlord_rent_bridge)
    after = set(sys.modules) - before
    for mod in after:
        root = mod.split(".")[0].lower()
        assert root not in forbidden, f"Forbidden module loaded: {mod}"
