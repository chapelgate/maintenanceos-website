from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


def _load_controlled_n2_deploy():
    path = Path(__file__).resolve().parents[1] / "scripts" / "controlled_n2_deploy.py"
    spec = importlib.util.spec_from_file_location("controlled_n2_deploy", path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_refusal_leaves_rollback_file_unchanged():
    mod = _load_controlled_n2_deploy()
    rollback_path = mod.ROLLBACK_FILE
    before = rollback_path.read_bytes() if rollback_path.exists() else None

    class BoomClient:
        pass

    report = {
        "target": {"name": "maintenanceos-redteam-v2", "id": "srv-test"},
        "env": {"credentials_present": {"TWILIO_AUTH_TOKEN": False}},
    }
    with pytest.raises(mod.RenderInventoryError) as exc:
        mod.apply_deploy(BoomClient(), report, branch="main", retarget=False)
    assert "TWILIO_AUTH_TOKEN" in str(exc.value)

    after = rollback_path.read_bytes() if rollback_path.exists() else None
    assert after == before
