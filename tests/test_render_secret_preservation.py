from __future__ import annotations

import importlib.util
from pathlib import Path

import httpx
import pytest

import render_inventory as ri


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "controlled_n2_deploy",
    ROOT / "scripts" / "controlled_n2_deploy.py",
)
assert SPEC and SPEC.loader
n2 = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(n2)


def test_n2_deploy_defaults_to_main_and_two_call_capacity():
    assert n2.DEFAULT_BRANCH == "main"
    assert n2.OPEN_CALL_ENV["GLOBAL_MAX_CONCURRENT_CALLS"] == "2"
    assert n2.OPEN_CALL_ENV["PER_CLIENT_MAX_CONCURRENT_CALLS"] == "2"


def test_n2_deploy_preserves_validated_voice_provider():
    # The deploy gate must not silently switch a working OpenAI lane to Gemini
    # (or vice versa) while opening the N=2 call window.
    assert "VOICE_PROVIDER" not in n2.OPEN_CALL_ENV


def test_protected_env_loss_fails_closed():
    before = {
        "TWILIO_AUTH_TOKEN": True,
        "OPENAI_API_KEY": True,
        "RESEND_API_KEY": False,
    }
    after = dict(before)
    n2._assert_protected_env_preserved(before, after)

    after["TWILIO_AUTH_TOKEN"] = False
    with pytest.raises(ri.RenderInventoryError, match="TWILIO_AUTH_TOKEN"):
        n2._assert_protected_env_preserved(before, after)


def test_render_env_mutation_is_per_key_not_collection_replace():
    seen: list[tuple[str, str]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append((request.method, request.url.path))
        return httpx.Response(200, json={"envVar": {"key": "SAFE_FLAG", "value": "true"}})

    transport = httpx.MockTransport(handler)
    with ri.RenderClient("test-key", transport=transport) as client:
        client.put_env_var("srv-test", "SAFE_FLAG", "true")

    assert seen == [("PUT", "/v1/services/srv-test/env-vars/SAFE_FLAG")]
    assert all(path != "/v1/services/srv-test/env-vars" for _, path in seen)
