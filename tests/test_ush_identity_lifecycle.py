"""USH identity lifecycle: expiry renewal, restart survival, revocation fail-closed.

Uses an in-process fake USH control plane that mirrors production issue_token TTL=3600.
Never prints secret material.
"""

from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import pytest

import ush_client
import ush_identity


class FakeClock:
    def __init__(self, start: float = 1_000_000.0):
        self.now = start

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


class FakeUshState:
    def __init__(self, bearer_ttl: float = 3600.0):
        self.bearer_ttl = bearer_ttl
        self.registered: dict[str, dict[str, Any]] = {}
        self.revoked: set[str] = set()
        self.exchange_count = 0
        self.capability_count = 0
        self.issued_tokens: list[str] = []
        self.clock = FakeClock()

    def issue_token(self, principal_id: str) -> dict[str, Any]:
        token = f"ush_sess_{principal_id}_{self.exchange_count}_{int(self.clock())}"
        self.exchange_count += 1
        self.issued_tokens.append(token)
        return {
            "access_token": token,
            "expires_in": int(self.bearer_ttl),
            "expires_at": self.clock() + self.bearer_ttl,
            "token_type": "bearer",
            "principal_id": principal_id,
        }


def _start_fake_ush(state: FakeUshState) -> tuple[HTTPServer, str]:
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
            return

        def _read_json(self) -> dict[str, Any]:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                return {}
            return json.loads(self.rfile.read(length).decode() or "{}")

        def _send(self, code: int, payload: dict[str, Any]) -> None:
            raw = json.dumps(payload).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self) -> None:  # noqa: N802
            path = urlparse(self.path).path
            if path == "/health":
                self._send(
                    200,
                    {
                        "status": "ok",
                        "kill_switch": False,
                        "profile": "production",
                        "providers": ["digitalocean", "twilio", "openai", "workload-identity"],
                        "digitalocean": {
                            "registered": True,
                            "adapter_class": "live_http",
                            "profile": "DO_USH_DEPLOY",
                        },
                    },
                )
                return
            if path == "/v1/capabilities":
                auth = self.headers.get("Authorization") or ""
                if not auth.startswith("Bearer ush_sess_"):
                    self._send(401, {"detail": "authentication_required"})
                    return
                token = auth.split(" ", 1)[1]
                principal = token.split("_")[2] if token.count("_") >= 2 else ""
                # token format ush_sess_{principal}_{n}_{ts} — principal may contain hyphens
                parts = token.split("_")
                # ush_sess_maintenanceos-v1-pilot_0_1000000
                if len(parts) < 4 or parts[0] != "ush" or parts[1] != "sess":
                    self._send(401, {"detail": "invalid_token"})
                    return
                # Reconstruct principal between sess and the exchange counter (numeric)
                mid = parts[2:-2]
                principal = "_".join(mid) if mid else parts[2]
                # Actually our tokens use: ush_sess_{principal_id}_{count}_{ts}
                # principal_id has hyphens not underscores: maintenanceos-v1-pilot
                try:
                    rest = token[len("ush_sess_") :]
                    principal, count_s, ts_s = rest.rsplit("_", 2)
                    int(count_s)
                    int(ts_s)
                except Exception:
                    self._send(401, {"detail": "invalid_token"})
                    return
                if principal in state.revoked:
                    self._send(401, {"detail": "principal_revoked"})
                    return
                # Expire check: token timestamp + ttl
                issued_at = float(ts_s)
                if state.clock() >= issued_at + state.bearer_ttl:
                    self._send(401, {"detail": "token_expired"})
                    return
                state.capability_count += 1
                self._send(200, {"ok": True, "principal_id": principal, "capabilities": ["digitalocean"]})
                return
            self._send(404, {"detail": "Not Found"})

        def do_POST(self) -> None:  # noqa: N802
            path = urlparse(self.path).path
            body = self._read_json()
            if path == "/v1/auth/workload":
                principal = str(body.get("principal_id") or "")
                if principal in state.revoked:
                    self._send(401, {"detail": "principal_revoked"})
                    return
                assertion = body.get("assertion") or ""
                public_key = body.get("public_key") or ""
                key_id = body.get("key_id") or ""
                if not assertion or not public_key or not key_id:
                    self._send(400, {"detail": "workload_assertion_required"})
                    return
                reg = state.registered.get(principal)
                if reg is None:
                    # Allow first exchange if public key present (simulates prior register)
                    if not public_key:
                        self._send(401, {"detail": "unknown_principal"})
                        return
                    state.registered[principal] = {"public_key": public_key, "key_id": key_id}
                    reg = state.registered[principal]
                if reg.get("public_key") != public_key or reg.get("key_id") != key_id:
                    self._send(401, {"detail": "workload_key_mismatch"})
                    return
                # Verify assertion signature locally
                try:
                    # Rebuild assertion object from compact form header.payload.sig
                    parts = str(assertion).split(".")
                    if len(parts) != 3:
                        raise ValueError("bad assertion")
                    signing_input = parts[0] + "." + parts[1]
                    payload_json = parts[1] + "=="
                    import base64

                    payload = json.loads(base64.urlsafe_b64decode(payload_json + "=="))
                    ush_identity.verify_assertion(
                        {
                            "public_key": public_key,
                            "signature": parts[2],
                            "signing_input": signing_input,
                            "payload": payload,
                        },
                        now=state.clock(),
                    )
                except Exception:
                    self._send(401, {"detail": "invalid_workload_identity"})
                    return
                self._send(200, state.issue_token(principal))
                return

            if path == "/v1/principals/register":
                bootstrap = self.headers.get("x-ush-bootstrap-token") or ""
                if bootstrap != "test-bootstrap-admin":
                    self._send(401, {"detail": "bootstrap_admin_required"})
                    return
                principal = str(body.get("id") or "")
                state.registered[principal] = {
                    "public_key": body.get("workload_public_key"),
                    "key_id": body.get("workload_key_id"),
                }
                # Mimic IdentityService.issue_token() TTL=3600 — MUST NOT be persisted by MOS
                issued = state.issue_token(principal)
                self._send(200, {"ok": True, "principal": {"id": principal}, **issued})
                return

            if path == "/v1/admin/policy/rules":
                self._send(200, {"ok": True})
                return

            if path == "/v1/admin/principals/" + (body.get("id") or "x") + "/revoke":
                self._send(404, {"detail": "use path"})
                return

            if path.startswith("/v1/admin/principals/") and path.endswith("/revoke"):
                principal = path.split("/")[4]
                state.revoked.add(principal)
                self._send(200, {"ok": True, "revoked": principal})
                return

            if path == "/v1/credentials/request":
                auth = self.headers.get("Authorization") or ""
                if not auth.startswith("Bearer ush_sess_"):
                    self._send(401, {"detail": "authentication_required"})
                    return
                self._send(200, {"ok": True, "provider": body.get("provider"), "capability": body.get("capability")})
                return

            self._send(404, {"detail": "Not Found"})

    server = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    host, port = server.server_address
    return server, f"http://{host}:{port}"


@pytest.fixture
def fake_ush(tmp_path, monkeypatch):
    state = FakeUshState(bearer_ttl=3600)
    server, base = _start_fake_ush(state)
    identity_dir = tmp_path / "ush-identity"
    secrets_dir = tmp_path
    monkeypatch.setenv("USH_BASE_URL", base)
    monkeypatch.setenv("MOS_SECRETS_DIR", str(secrets_dir))
    monkeypatch.setenv("USH_IDENTITY_DIR", str(identity_dir))
    monkeypatch.delenv("USH_WORKLOAD_TOKEN", raising=False)
    monkeypatch.delenv("USH_ALLOW_LEGACY_BEARER", raising=False)
    monkeypatch.delenv("USH_BOOTSTRAP_TOKEN", raising=False)
    ush_identity.reset_runtime()
    yield state, base, identity_dir, secrets_dir
    server.shutdown()
    ush_identity.reset_runtime()


def _bootstrap_identity(state: FakeUshState, identity_dir: Path, base: str, clock: FakeClock) -> ush_identity.WorkloadIdentity:
    identity = ush_identity.generate_identity()
    ush_identity.save_identity(identity, identity_dir)
    state.registered[identity.principal_id] = {
        "public_key": identity.public_key_b64,
        "key_id": identity.key_id,
    }
    runtime = ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    runtime.ensure_access_token()
    return identity


def test_does_not_persist_issue_token_as_permanent_workload_token(fake_ush, monkeypatch):
    state, base, identity_dir, secrets_dir = fake_ush
    monkeypatch.setenv("USH_BOOTSTRAP_TOKEN", "test-bootstrap-admin")
    import importlib.util

    path = Path(__file__).resolve().parents[1] / "scripts" / "ush_establish_mos_identity.py"
    spec = importlib.util.spec_from_file_location("ush_establish_mos_identity", path)
    assert spec and spec.loader
    establish = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(establish)
    monkeypatch.setattr(establish, "SECRETS_DIR", secrets_dir)
    monkeypatch.setattr(establish, "IDENTITY_DIR", identity_dir)
    rc = establish.main()
    assert rc == 0
    assert not (secrets_dir / "USH_WORKLOAD_TOKEN").exists()
    assert (identity_dir / "private.pem").exists()
    assert (identity_dir / "identity.json").exists()
    assert (identity_dir / "bearer.cache.json").exists()
    # Register issued a token, and exchange issued another — both ephemeral
    assert state.exchange_count >= 2


def test_renews_after_bearer_expiry_without_human(fake_ush):
    state, base, identity_dir, _secrets = fake_ush
    clock = state.clock
    _bootstrap_identity(state, identity_dir, base, clock)
    runtime = ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    first = runtime.ensure_access_token()
    exchanges_after_first = state.exchange_count

    # Advance past 3600s issue_token TTL (+ skew)
    clock.advance(3600 + 121)
    second = runtime.ensure_access_token()
    assert second != first
    assert state.exchange_count == exchanges_after_first + 1

    # Authenticated API still works with renewed bearer
    ush_identity.reset_runtime()
    ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    caps = ush_client.list_capabilities()
    assert caps.get("ok") is True


def test_identity_survives_restart_and_redeploy(fake_ush):
    state, base, identity_dir, _secrets = fake_ush
    clock = state.clock
    identity = _bootstrap_identity(state, identity_dir, base, clock)
    key_id = identity.key_id
    first_exchanges = state.exchange_count

    # Simulate process restart: clear runtime memory, keep durable files
    ush_identity.reset_runtime()
    runtime = ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    loaded = ush_identity.load_identity(identity_dir)
    assert loaded is not None
    assert loaded.key_id == key_id

    # Bearer cache still valid — no new exchange required
    token = runtime.ensure_access_token()
    assert token
    assert state.exchange_count == first_exchanges

    # Simulate host restart that wiped only ephemeral cache
    ush_identity.clear_bearer_cache(identity_dir)
    ush_identity.reset_runtime()
    runtime = ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    token2 = runtime.ensure_access_token()
    assert token2
    assert state.exchange_count == first_exchanges + 1
    assert ush_identity.load_identity(identity_dir).key_id == key_id


def test_revocation_fails_closed(fake_ush):
    state, base, identity_dir, _secrets = fake_ush
    clock = state.clock
    identity = _bootstrap_identity(state, identity_dir, base, clock)
    runtime = ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    assert runtime.ensure_access_token()

    # USH admin revokes principal
    state.revoked.add(identity.principal_id)
    ush_identity.clear_bearer_cache(identity_dir)
    runtime._memory_bearer = None
    clock.advance(3600 + 121)

    with pytest.raises(ush_identity.UshIdentityError) as exc:
        runtime.ensure_access_token()
    assert exc.value.code in {"USH_IDENTITY_REVOKED", "USH_IDENTITY_RENEWAL_FAILED"}

    # Client must fail closed — no silent success
    ush_identity.reset_runtime()
    ush_identity.get_runtime(directory=identity_dir, clock=clock, base_url=base, refresh_skew=120)
    with pytest.raises(ush_client.UshError) as client_exc:
        ush_client.list_capabilities()
    assert client_exc.value.code in {
        "USH_IDENTITY_REVOKED",
        "USH_IDENTITY_RENEWAL_FAILED",
        "USH_HTTP",
        "USH_IDENTITY_MISSING",
    }


def test_missing_durable_identity_fails_closed(fake_ush, monkeypatch):
    _state, _base, identity_dir, _secrets = fake_ush
    monkeypatch.setenv("USH_WORKLOAD_TOKEN", "ush_sess_should_not_be_used_as_permanent")
    ush_identity.reset_runtime()
    ush_identity.get_runtime(directory=identity_dir)
    with pytest.raises(ush_client.UshError) as exc:
        ush_client.digitalocean_deploy_capability()
    assert exc.value.code == "USH_IDENTITY_MISSING"


def test_release_gates_require_durable_identity(fake_ush):
    _state, _base, _identity_dir, _secrets = fake_ush
    ush_identity.reset_runtime()
    gates = ush_client.release_gates()["gates"]
    assert gates["legacy_permanent_bearer_forbidden"] is True
    assert gates["identity_lifecycle_renewable"] is True
    assert gates["durable_workload_identity_present"] is False
    assert gates["ready_for_do_provision"] is False
