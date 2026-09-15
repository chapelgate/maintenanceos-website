import json

import httpx
import pytest

import render_inventory as ri


def test_hlo_names_are_never_maintenanceos():
    assert ri.is_hlo_resource("chapelgate-hlo-production")
    assert ri.is_hlo_resource("Holiday Let Operator")
    assert not ri.is_maintenanceos_resource("chapelgate-hlo-production")
    assert ri.is_maintenanceos_resource("maintenanceos-redteam-v2")
    assert not ri.is_hlo_resource("maintenanceos-redteam-v2")


def test_redact_env_never_copies_secret_values():
    env = {
        "GEMINI_API_KEY": "super-secret-gemini",
        "TWILIO_AUTH_TOKEN": "super-secret-twilio",
        "TWILIO_PHONE_NUMBER": "+441234567890",
        "TWILIO_HUMAN_TRANSFER_NUMBER": "+449876543210",
        "ENABLE_REALTIME_VOICE": "true",
        "ENABLE_PUBLIC_PROVIDER_INGRESS": "false",
        "VERIFY_TWILIO_SIGNATURES": "true",
        "ENABLE_CONTRACTOR_PORTAL": "false",
        "ENABLE_LIVE_EMAIL": "false",
        "ENABLE_LIVE_MESSAGING": "false",
        "ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE": "false",
        "VOICE_PROVIDER": "gemini",
        "DEFAULT_AUTO_DISPATCH_LIMIT": "0",
        "PUBLIC_BASE_URL": "https://maintenanceos-redteam-v2.onrender.com",
        "DATABASE_URL": "postgresql://user:pass@db.internal/maintenanceos",
        "PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE": "60",
        "PUBLIC_WS_RATE_LIMIT_PER_MINUTE": "20",
    }
    redacted = ri.redact_env(env)
    blob = json.dumps(redacted)
    assert "super-secret-gemini" not in blob
    assert "super-secret-twilio" not in blob
    assert "+441234567890" not in blob
    assert "postgresql://user:pass" not in blob
    assert redacted["realtime_voice_enabled"] is True
    assert redacted["credentials_present"]["GEMINI_API_KEY"] is True
    assert redacted["dedicated_test_number_distinct"] is True
    assert redacted["database_scheme"] == "postgresql"
    assert ri.closed_pre_call_ready(redacted) is False


def test_closed_pre_call_ready_when_flags_match():
    env = {
        "VERIFY_TWILIO_SIGNATURES": "true",
        "ENABLE_REALTIME_VOICE": "false",
        "ENABLE_PUBLIC_PROVIDER_INGRESS": "false",
        "ENABLE_CONTRACTOR_PORTAL": "false",
        "ENABLE_LIVE_EMAIL": "false",
        "ENABLE_LIVE_MESSAGING": "false",
        "ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE": "false",
        "VOICE_PROVIDER": "gemini",
        "DEFAULT_AUTO_DISPATCH_LIMIT": "0",
        "PUBLIC_BASE_URL": "https://maintenanceos-redteam-v2.onrender.com",
        "PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE": "60",
        "PUBLIC_WS_RATE_LIMIT_PER_MINUTE": "20",
    }
    assert ri.closed_pre_call_ready(ri.redact_env(env)) is True


def test_apply_closed_flags_refuses_hlo():
    class Boom:
        def put_env_var(self, *args, **kwargs):
            raise AssertionError("must not mutate HLO")

        def trigger_deploy(self, *args, **kwargs):
            raise AssertionError("must not deploy HLO")

    with pytest.raises(ri.RenderInventoryError):
        ri.apply_closed_flags(Boom(), {"id": "srv-hlo", "name": "chapelgate-hlo-production"})


def test_apply_closed_flags_refuses_unrelated_service():
    class Boom:
        def put_env_var(self, *args, **kwargs):
            raise AssertionError("must not mutate unrelated service")

        def trigger_deploy(self, *args, **kwargs):
            raise AssertionError("must not deploy unrelated service")

    with pytest.raises(ri.RenderInventoryError):
        ri.apply_closed_flags(Boom(), {"id": "srv-other", "name": "cheap-trips"})


def test_payload_leaks_detects_phone_and_bearer():
    leaks = ri.payload_leaks({"note": "call +441234567890"}, [])
    assert "phone_number" in leaks
    leaks = ri.payload_leaks({"Authorization": "Bearer abc"}, [])
    assert "authorization_header" in leaks


def test_missing_api_key_fails_closed(monkeypatch):
    monkeypatch.delenv("RENDER_API_KEY", raising=False)
    monkeypatch.setattr(ri, "probe_public_health", lambda: {"reachable": True, "realtime_voice": True, "ok": True, "http_status": 200, "version_is_v1_pilot": True})
    assert ri.main([]) == 2


def _handler(request: httpx.Request) -> httpx.Response:
    path = request.url.path
    if path == "/v1/owners":
        return httpx.Response(200, json=[{"owner": {"id": "tea-dah7d4h5efls738bode0", "name": "Chapelgate", "type": "team"}, "cursor": "a"}])
    if path == "/v1/services":
        return httpx.Response(200, json=[
            {"service": {"id": "srv-hlo", "name": "chapelgate-hlo-production", "type": "web_service", "ownerId": "tea-dah7d4h5efls738bode0", "autoDeploy": "no"}, "cursor": "1"},
            {"service": {
                "id": "srv-dahhskafngtc739pnplg",
                "name": "maintenanceos-redteam-v2",
                "type": "web_service",
                "ownerId": "tea-dah7d4h5efls738bode0",
                "repo": "https://github.com/chapelgate/cloud-workers",
                "branch": "main",
                "autoDeploy": "no",
                "suspended": "not_suspended",
                "serviceDetails": {"url": "https://maintenanceos-redteam-v2.onrender.com", "region": "frankfurt"},
            }, "cursor": "2"},
        ])
    if path == "/v1/postgres":
        return httpx.Response(200, json=[])
    if path == "/v1/services/srv-dahhskafngtc739pnplg/env-vars":
        return httpx.Response(200, json=[{
            "envVar": {"key": "ENABLE_REALTIME_VOICE", "value": "true"},
            "cursor": "e1",
        }, {
            "envVar": {"key": "GEMINI_API_KEY", "value": "must-never-appear"},
            "cursor": "e2",
        }])
    if request.method == "POST" and path == "/v1/services/srv-dahhskafngtc739pnplg/deploys":
        return httpx.Response(201, json={"id": "dep-2", "status": "queued"})
    if path == "/v1/services/srv-dahhskafngtc739pnplg/deploys":
        return httpx.Response(200, json=[{
            "deploy": {"id": "dep-1", "status": "live", "trigger": "manual", "commit": {"id": "a8fd4979171a3a0059caf52d24ee7fc0337efd25"}},
            "cursor": "d1",
        }])
    if request.method == "PUT" and path.endswith((
        "/env-vars/ENABLE_REALTIME_VOICE",
        "/env-vars/ENABLE_PUBLIC_PROVIDER_INGRESS",
    )):
        return httpx.Response(200, json={"key": "flag", "value": "false"})
    return httpx.Response(404, json={"message": "not found"})


def test_inventory_is_boolean_only_and_skips_hlo():
    transport = httpx.MockTransport(_handler)
    with ri.RenderClient("test-key", transport=transport) as client:
        report = ri.inventory(client, health={"reachable": True, "ok": True, "realtime_voice": True, "http_status": 200, "version_is_v1_pilot": True})
    blob = json.dumps(report)
    assert "must-never-appear" not in blob
    assert "test-key" not in blob
    assert report["target"]["name"] == "maintenanceos-redteam-v2"
    assert report["skipped_hlo_services"] == [{"id": "srv-hlo", "name": "chapelgate-hlo-production"}]
    assert report["env"]["realtime_voice_enabled"] is True
    assert report["env"]["credentials_present"]["GEMINI_API_KEY"] is True
    assert report["closed_pre_call_ready"] is False
    assert report["legacy_cloud_workers_deployed"] is True
    assert report["canonical_repo_deployed"] is False
    assert report["ready_for_controlled_test_call"] is False
    assert report["hlo_untouched"] is True


def test_apply_closed_flags_on_mos_target():
    transport = httpx.MockTransport(_handler)
    with ri.RenderClient("test-key", transport=transport) as client:
        result = ri.apply_closed_flags(client, {
            "id": "srv-dahhskafngtc739pnplg",
            "name": "maintenanceos-redteam-v2",
        })
    assert result["keys_set_false"] == ["ENABLE_REALTIME_VOICE", "ENABLE_PUBLIC_PROVIDER_INGRESS"]
    assert result["deploy"]["id"] == "dep-2"
