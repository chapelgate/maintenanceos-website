import ast
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

from landlord_maintenance_bridge import (
    ALLOWED_LANDLORD_STATES,
    build_handoff_payload,
    handoff_from_mos_job,
)

MOS_EXECUTION_STATES = {
    "NEW",
    "READY_FOR_DISPATCH",
    "AWAITING_CONTRACTOR",
    "IN_PROGRESS",
    "CLOSED",
}


def test_payload_includes_mos_job_and_property_ids():
    job = SimpleNamespace(id=42, property_id=7, status="READY_FOR_DISPATCH")
    payload = handoff_from_mos_job(job, summary="Leaking tap")
    assert payload["mos_job_id"] == 42
    assert payload["property_id"] == 7
    built = build_handoff_payload(mos_job_id=job.id, property_id=job.property_id)
    assert built["mos_job_id"] == job.id
    assert built["property_id"] == job.property_id


def test_mos_remains_system_of_record():
    job = SimpleNamespace(id=9, property_id=3, status="NEW")
    payload = handoff_from_mos_job(job)
    assert payload["system_of_record"] == "MOS"
    assert payload["triage_owner"] == "MOS"
    assert payload["dispatch_owner"] == "MOS"
    assert payload["landlord_state"] in ALLOWED_LANDLORD_STATES
    assert payload["landlord_state"] not in MOS_EXECUTION_STATES
    assert job.status == "NEW"
    with pytest.raises(ValueError):
        build_handoff_payload(
            mos_job_id=9,
            property_id=3,
            landlord_state="READY_FOR_DISPATCH",
        )


def test_no_voice_or_telephony_imports():
    import landlord_maintenance_bridge as bridge

    before = set(sys.modules)
    source = Path(bridge.__file__).read_text(encoding="utf-8")
    tree = ast.parse(source)
    imported = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imported.append(node.module)
    banned = ("voice", "telephony", "twilio", "channels", "provider_webhooks")
    for name in imported:
        lowered = name.lower()
        assert not any(token in lowered for token in banned)
    lowered_source = source.lower()
    for token in (
        "voice_bridge",
        "telephony",
        "twilio",
        "provider_webhooks",
        "import channels",
        "from channels",
    ):
        assert token not in lowered_source
    loaded = [name for name in sys.modules if name not in before]
    for name in loaded:
        lowered = name.lower()
        assert "voice" not in lowered
        assert "telephony" not in lowered
        assert "twilio" not in lowered
