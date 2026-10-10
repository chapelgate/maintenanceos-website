"""Merged live/main voice_bridge: every deterministic escalation reason must still end
the Media Stream, while recoverable model defects keep the caller connected."""
import inspect
import re

import pytest

import voice_bridge as vb


def _escalation_reasons():
    src = inspect.getsource(vb.requires_immediate_human_escalation)
    return sorted(set(re.findall(r'return True, "([a-z_]+)"', src)))


def test_escalation_reasons_are_discovered():
    reasons = _escalation_reasons()
    assert {"deterministic_safety", "gate_emergency_handoff", "animal_welfare_emergency"} <= set(reasons)


@pytest.mark.parametrize("reason", _escalation_reasons() + ["deterministic_escalation", "caller_requested_human"])
def test_every_escalation_reason_ends_media_stream(reason):
    assert vb.ends_media_stream(reason)


@pytest.mark.parametrize("reason", [
    "resident_key_contract_failed",
    "openai_response_failed",
    "voice_transport_disconnected",
    "assistant_policy_rejected:critical_safety_conflict",
])
def test_recoverable_defects_keep_stream_open(reason):
    assert not vb.ends_media_stream(reason)


def test_gas_co_advice_path_still_precedes_transfer():
    src = inspect.getsource(vb.handle_twilio_media_stream)
    advice = src.index("safety_advice_for_flags(_flags)")
    transfer = src.index("await request_transfer(", advice)
    assert advice < transfer
