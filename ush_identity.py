"""Renewable MaintenanceOS → USH workload identity.

Architecture (do NOT persist USH issue_token() bearers as long-lived secrets):

  Durable trust root (survives restart/redeploy):
    $MOS_SECRETS_DIR/ush-identity/private.pem   Ed25519 private key
    $MOS_SECRETS_DIR/ush-identity/identity.json metadata + public key

  Ephemeral session (auto-refreshed, disposable):
    $MOS_SECRETS_DIR/ush-identity/bearer.cache.json  {token, expires_at}

  Flow:
    1. One-time bootstrap registers principal + public key with USH (admin).
    2. Runtime signs a short assertion with the private key.
    3. POST /v1/auth/workload exchanges assertion → short-lived USH bearer.
    4. Before expiry (default skew 120s), re-exchange automatically.
    5. Fail closed if renewal fails or principal is revoked.

Never place DIGITALOCEAN_TOKEN in Cursor/Git/MOS source.
Never treat a 3600s principal bearer as permanent USH_WORKLOAD_TOKEN.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import ssl
import tempfile
import threading
import time
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)

MOS_PROJECT = "maintenanceos"
MOS_ENVIRONMENT = "london"
MOS_TENANT = "chapelgate"
MOS_PRINCIPAL_ID = "maintenanceos-v1-pilot"

DEFAULT_USH_BASE = "https://138.68.183.183"
DEFAULT_BEARER_TTL_HINT = 3600
DEFAULT_REFRESH_SKEW_SECONDS = 120
ASSERTION_TTL_SECONDS = 300


class UshIdentityError(RuntimeError):
    def __init__(self, code: str, detail: str = ""):
        super().__init__(code if not detail else f"{code}:{detail}")
        self.code = code
        self.detail = detail


Clock = Callable[[], float]


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_json(obj: dict[str, Any]) -> str:
    return _b64url(json.dumps(obj, separators=(",", ":"), sort_keys=True).encode())


def identity_dir(secrets_dir: Path | None = None) -> Path:
    root = secrets_dir or Path(os.getenv("MOS_SECRETS_DIR", "/tmp/mos-secrets"))
    return Path(os.getenv("USH_IDENTITY_DIR") or (root / "ush-identity"))


def ush_base_url() -> str:
    return (os.getenv("USH_BASE_URL") or os.getenv("UNIVERSAL_SECRETS_URL") or DEFAULT_USH_BASE).rstrip("/")


def _tls_context() -> ssl.SSLContext:
    verify = (os.getenv("USH_TLS_VERIFY") or "").strip().lower() in {"1", "true", "yes", "on"}
    return ssl.create_default_context() if verify else ssl._create_unverified_context()


@dataclass
class BearerSession:
    access_token: str
    expires_at: float
    issued_at: float

    def valid(self, now: float, *, skew: float = DEFAULT_REFRESH_SKEW_SECONDS) -> bool:
        return bool(self.access_token) and now < (self.expires_at - skew)


@dataclass
class WorkloadIdentity:
    principal_id: str
    project: str
    environment: str
    tenant: str
    key_id: str
    public_key_b64: str
    private_key: Ed25519PrivateKey

    def public_key_pem(self) -> str:
        pub = self.private_key.public_key()
        return pub.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode()


def generate_identity(
    *,
    principal_id: str = MOS_PRINCIPAL_ID,
    project: str = MOS_PROJECT,
    environment: str = MOS_ENVIRONMENT,
    tenant: str = MOS_TENANT,
) -> WorkloadIdentity:
    private = Ed25519PrivateKey.generate()
    public = private.public_key()
    pub_raw = public.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    key_id = hashlib.sha256(pub_raw).hexdigest()[:32]
    return WorkloadIdentity(
        principal_id=principal_id,
        project=project,
        environment=environment,
        tenant=tenant,
        key_id=key_id,
        public_key_b64=_b64url(pub_raw),
        private_key=private,
    )


def _ensure_secret_dir(d: Path) -> None:
    d.mkdir(mode=0o700, parents=True, exist_ok=True)
    try:
        os.chmod(d, 0o700)
    except OSError:
        pass


def _atomic_write_text(path: Path, text: str, *, mode: int = 0o600) -> None:
    """Write secrets atomically (temp + replace) with restrictive permissions."""
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=str(path.parent), text=True)
    tmp_path = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp_path, mode)
        os.replace(tmp_path, path)
        os.chmod(path, mode)
    except Exception:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass
        raise


def save_identity(identity: WorkloadIdentity, directory: Path | None = None) -> Path:
    """Persist durable key material. Never writes USH bearers here."""
    d = directory if directory is not None else identity_dir()
    _ensure_secret_dir(d)
    priv_path = d / "private.pem"
    meta_path = d / "identity.json"
    pem = identity.private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    _atomic_write_text(priv_path, pem.decode("utf-8"), mode=0o600)
    meta = {
        "principal_id": identity.principal_id,
        "project": identity.project,
        "environment": identity.environment,
        "tenant": identity.tenant,
        "key_id": identity.key_id,
        "public_key_b64": identity.public_key_b64,
        "public_key_pem": identity.public_key_pem(),
        "kind": "ed25519_workload",
        "note": "Durable MOS→USH trust root. Short-lived USH bearers live only in bearer.cache.json.",
    }
    _atomic_write_text(meta_path, json.dumps(meta, indent=2) + "\n", mode=0o600)
    return d


def load_identity(directory: Path | None = None) -> WorkloadIdentity | None:
    d = directory or identity_dir()
    priv_path = d / "private.pem"
    meta_path = d / "identity.json"
    if not priv_path.is_file() or not meta_path.is_file():
        return None
    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        private = serialization.load_pem_private_key(priv_path.read_bytes(), password=None)
        if not isinstance(private, Ed25519PrivateKey):
            raise UshIdentityError("USH_IDENTITY_INVALID", "private key is not Ed25519")
        return WorkloadIdentity(
            principal_id=str(meta.get("principal_id") or MOS_PRINCIPAL_ID),
            project=str(meta.get("project") or MOS_PROJECT),
            environment=str(meta.get("environment") or MOS_ENVIRONMENT),
            tenant=str(meta.get("tenant") or MOS_TENANT),
            key_id=str(meta.get("key_id") or ""),
            public_key_b64=str(meta.get("public_key_b64") or ""),
            private_key=private,
        )
    except UshIdentityError:
        raise
    except Exception as exc:
        raise UshIdentityError("USH_IDENTITY_CORRUPT", type(exc).__name__) from None


def clear_bearer_cache(directory: Path | None = None) -> None:
    path = (directory or identity_dir()) / "bearer.cache.json"
    if path.is_file():
        path.unlink()


def load_bearer_cache(directory: Path | None = None) -> BearerSession | None:
    path = (directory or identity_dir()) / "bearer.cache.json"
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        token = str(data.get("access_token") or data.get("token") or "").strip()
        expires_at = float(data.get("expires_at") or 0)
        issued_at = float(data.get("issued_at") or 0)
        if not token or expires_at <= 0:
            return None
        return BearerSession(access_token=token, expires_at=expires_at, issued_at=issued_at)
    except Exception:
        return None


def save_bearer_cache(session: BearerSession, directory: Path | None = None) -> None:
    d = directory or identity_dir()
    _ensure_secret_dir(d)
    path = d / "bearer.cache.json"
    _atomic_write_text(
        path,
        json.dumps(
            {
                "access_token": session.access_token,
                "expires_at": session.expires_at,
                "issued_at": session.issued_at,
                "ephemeral": True,
                "note": "Disposable USH session bearer — renew via workload key assertion",
            },
            indent=2,
        )
        + "\n",
        mode=0o600,
    )


def build_assertion(identity: WorkloadIdentity, *, now: float | None = None, nonce: str | None = None) -> dict[str, Any]:
    """Create a signed workload assertion for POST /v1/auth/workload."""
    ts = float(now if now is not None else time.time())
    body = {
        "principal_id": identity.principal_id,
        "project": identity.project,
        "environment": identity.environment,
        "tenant": identity.tenant,
        "key_id": identity.key_id,
        "public_key": identity.public_key_b64,
        "iat": int(ts),
        "exp": int(ts + ASSERTION_TTL_SECONDS),
        "nonce": nonce or uuid.uuid4().hex,
        "aud": "ush",
        "iss": "maintenanceos-workload",
    }
    signing_input = _b64url_json({"alg": "EdDSA", "typ": "USH-WID", "kid": identity.key_id}) + "." + _b64url_json(body)
    signature = identity.private_key.sign(signing_input.encode("ascii"))
    return {
        "alg": "EdDSA",
        "key_id": identity.key_id,
        "public_key": identity.public_key_b64,
        "payload": body,
        "signing_input": signing_input,
        "signature": _b64url(signature),
        "assertion": signing_input + "." + _b64url(signature),
    }


def verify_assertion(assertion_obj: dict[str, Any], *, now: float | None = None) -> dict[str, Any]:
    """Local verification helper (tests / diagnostics). Never logs secrets."""
    ts = float(now if now is not None else time.time())
    payload = assertion_obj.get("payload") or {}
    if int(payload.get("exp") or 0) < ts:
        raise UshIdentityError("USH_ASSERTION_EXPIRED")
    pub_raw = base64.urlsafe_b64decode(assertion_obj["public_key"] + "==")
    public = Ed25519PublicKey.from_public_bytes(pub_raw)
    sig = base64.urlsafe_b64decode(assertion_obj["signature"] + "==")
    public.verify(sig, assertion_obj["signing_input"].encode("ascii"))
    return payload


def _http_json(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    *,
    headers: dict[str, str] | None = None,
    opener: Callable[..., Any] | None = None,
) -> tuple[int, dict[str, Any]]:
    h = {"Accept": "application/json", "User-Agent": "maintenanceos-ush-identity/2", **(headers or {})}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    open_fn = opener or (lambda r, **kw: urllib.request.urlopen(r, timeout=45, context=_tls_context()))
    try:
        with open_fn(req) as resp:
            raw = resp.read().decode() or "{}"
            parsed = json.loads(raw) if raw.startswith("{") or raw.startswith("[") else {"data": raw}
            return getattr(resp, "status", 200), parsed if isinstance(parsed, dict) else {"data": parsed}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode() or ""
        try:
            parsed = json.loads(raw) if raw else {}
        except Exception:
            parsed = {"detail": raw[:200]}
        return exc.code, parsed if isinstance(parsed, dict) else {"detail": str(parsed)}
    except urllib.error.URLError as exc:
        raise UshIdentityError("USH_NETWORK", type(exc).__name__) from None


def _parse_bearer_body(body: dict[str, Any], *, now: float) -> BearerSession:
    token = ""
    for key in ("access_token", "token", "workload_token", "bearer"):
        val = body.get(key)
        if isinstance(val, str) and val.strip():
            token = val.strip()
            break
    if not token and isinstance(body.get("session"), dict):
        for key in ("access_token", "token"):
            val = body["session"].get(key)
            if isinstance(val, str) and val.strip():
                token = val.strip()
                break
    if not token:
        raise UshIdentityError("USH_IDENTITY_RENEWAL_FAILED", "bearer_missing_in_response")

    if "expires_at" in body:
        expires_at = float(body["expires_at"])
    elif "expires_in" in body:
        expires_at = now + float(body["expires_in"])
    elif isinstance(body.get("session"), dict) and body["session"].get("expires_in"):
        expires_at = now + float(body["session"]["expires_in"])
    else:
        expires_at = now + float(os.getenv("USH_BEARER_TTL_HINT") or DEFAULT_BEARER_TTL_HINT)
    return BearerSession(access_token=token, expires_at=expires_at, issued_at=now)


def _raise_auth_failure(code: int, body: dict[str, Any]) -> None:
    detail = str(body.get("detail") or body.get("error") or code)
    if code in {401, 403} and "revok" in detail.lower():
        raise UshIdentityError("USH_IDENTITY_REVOKED", detail[:80])
    if code >= 400:
        raise UshIdentityError("USH_IDENTITY_RENEWAL_FAILED", f"{code}:{detail[:80]}")


def platform_workload_token() -> str:
    """Cloud/platform workload token for live USH POST /v1/auth/workload.

    Live USH (2026-09) requires JSON field ``workload_token`` (IMDS / managed-identity JWT).
    Ed25519 assertions remain supported for test fakes and future USH upgrades.
    """
    for key in ("USH_PLATFORM_WORKLOAD_TOKEN", "CLOUD_WORKLOAD_TOKEN", "DO_WORKLOAD_TOKEN"):
        val = (os.getenv(key) or "").strip()
        if val:
            return val
    path = Path(os.getenv("USH_PLATFORM_WORKLOAD_TOKEN_FILE") or "")
    if path.is_file():
        return path.read_text(encoding="utf-8").strip()
    return ""


def resume_bearer(
    session: BearerSession,
    *,
    now: float | None = None,
    base_url: str | None = None,
    opener: Callable[..., Any] | None = None,
) -> BearerSession:
    """Renew an existing short-lived bearer via POST /v1/auth/resume (live USH path)."""
    ts = float(now if now is not None else time.time())
    auth = session.access_token
    headers = {"Authorization": auth if auth.lower().startswith("bearer ") else f"Bearer {auth}"}
    code, body = _http_json(
        "POST",
        f"{(base_url or ush_base_url()).rstrip('/')}/v1/auth/resume",
        {"reason": "maintenanceos_auto_refresh"},
        headers=headers,
        opener=opener,
    )
    _raise_auth_failure(code, body)
    return _parse_bearer_body(body, now=ts)


def exchange_workload_bearer(
    identity: WorkloadIdentity,
    *,
    now: float | None = None,
    base_url: str | None = None,
    opener: Callable[..., Any] | None = None,
) -> BearerSession:
    """Mint a short-lived USH bearer.

    Order:
      1. Platform ``workload_token`` (live USH control plane)
      2. Ed25519 signed assertion (tests / future USH EdDSA support)
    """
    ts = float(now if now is not None else time.time())
    base = (base_url or ush_base_url()).rstrip("/")

    platform = platform_workload_token()
    if platform:
        code, body = _http_json(
            "POST",
            f"{base}/v1/auth/workload",
            {
                "workload_token": platform,
                "principal_id": identity.principal_id,
                "project": identity.project,
                "environment": identity.environment,
                "tenant": identity.tenant,
                "kind": "application",
            },
            opener=opener,
        )
        _raise_auth_failure(code, body)
        return _parse_bearer_body(body, now=ts)

    assertion = build_assertion(identity, now=ts)
    payload = {
        "principal_id": identity.principal_id,
        "project": identity.project,
        "environment": identity.environment,
        "tenant": identity.tenant,
        "kind": "application",
        "delivery_mode": "workload_identity",
        "key_id": identity.key_id,
        "public_key": identity.public_key_b64,
        "assertion": assertion["assertion"],
        "assertion_payload": assertion["payload"],
        "signature": assertion["signature"],
        # Live USH currently keys off workload_token; assertion retained for compatible fakes.
        "workload_token": assertion["assertion"],
    }
    code, body = _http_json(
        "POST",
        f"{base}/v1/auth/workload",
        payload,
        opener=opener,
    )
    _raise_auth_failure(code, body)
    return _parse_bearer_body(body, now=ts)


def seed_ephemeral_bearer(
    access_token: str,
    *,
    expires_at: float | None = None,
    expires_in: float | None = None,
    directory: Path | None = None,
    now: float | None = None,
) -> BearerSession:
    """Cache a short-lived bearer from bootstrap/register — never as USH_WORKLOAD_TOKEN."""
    ts = float(now if now is not None else time.time())
    if expires_at is None:
        ttl = float(expires_in if expires_in is not None else (os.getenv("USH_BEARER_TTL_HINT") or DEFAULT_BEARER_TTL_HINT))
        expires_at = ts + ttl
    session = BearerSession(access_token=access_token.strip(), expires_at=float(expires_at), issued_at=ts)
    save_bearer_cache(session, directory)
    return session


class IdentityRuntime:
    """Process-local renewable identity: durable key on disk + ephemeral bearer cache."""

    def __init__(
        self,
        *,
        directory: Path | None = None,
        clock: Clock | None = None,
        refresh_skew: float = DEFAULT_REFRESH_SKEW_SECONDS,
        opener: Callable[..., Any] | None = None,
        base_url: str | None = None,
    ):
        self.directory = directory or identity_dir()
        self.clock: Clock = clock or time.time
        self.refresh_skew = refresh_skew
        self.opener = opener
        self.base_url = base_url
        self._memory_bearer: BearerSession | None = None
        self._revoked = False
        self._refresh_lock = threading.RLock()

    def has_durable_identity(self) -> bool:
        return (self.directory / "private.pem").is_file() and (self.directory / "identity.json").is_file()

    def mark_revoked(self) -> None:
        with self._refresh_lock:
            self._revoked = True
            self._memory_bearer = None
            clear_bearer_cache(self.directory)

    def ensure_access_token(self) -> str:
        with self._refresh_lock:
            if self._revoked:
                raise UshIdentityError("USH_IDENTITY_REVOKED")
            identity = load_identity(self.directory)
            if identity is None:
                raise UshIdentityError(
                    "USH_IDENTITY_MISSING",
                    "durable workload keypair absent — refuse permanent 1h bearer; run identity bootstrap once",
                )
            now = float(self.clock())
            session = self._memory_bearer or load_bearer_cache(self.directory)
            if session and session.valid(now, skew=self.refresh_skew):
                self._memory_bearer = session
                return session.access_token
            # Near/past expiry — prefer resume (live USH), then mint via platform token / assertion.
            try:
                if session and session.access_token:
                    try:
                        session = resume_bearer(
                            session,
                            now=now,
                            base_url=self.base_url,
                            opener=self.opener,
                        )
                    except UshIdentityError as resume_exc:
                        if resume_exc.code == "USH_IDENTITY_REVOKED":
                            raise
                        session = exchange_workload_bearer(
                            identity,
                            now=now,
                            base_url=self.base_url,
                            opener=self.opener,
                        )
                else:
                    session = exchange_workload_bearer(
                        identity,
                        now=now,
                        base_url=self.base_url,
                        opener=self.opener,
                    )
            except UshIdentityError as exc:
                self._memory_bearer = None
                clear_bearer_cache(self.directory)
                if exc.code == "USH_IDENTITY_REVOKED":
                    self._revoked = True
                raise
            self._memory_bearer = session
            save_bearer_cache(session, self.directory)
            return session.access_token

    def authorization_header(self) -> dict[str, str]:
        token = self.ensure_access_token()
        value = token if token.lower().startswith("bearer ") else f"Bearer {token}"
        identity = load_identity(self.directory)
        headers = {"Authorization": value}
        if identity:
            headers["X-USH-Principal-Id"] = identity.principal_id
            headers["X-USH-Client-Id"] = identity.principal_id
            headers["X-USH-Tenant-Id"] = identity.tenant
        return headers

    def status(self) -> dict[str, Any]:
        identity = load_identity(self.directory)
        session = self._memory_bearer or load_bearer_cache(self.directory)
        now = float(self.clock())
        return {
            "durable_identity_present": identity is not None,
            "principal_id": identity.principal_id if identity else None,
            "key_id": identity.key_id if identity else None,
            "bearer_cached": session is not None,
            "bearer_valid": bool(session and session.valid(now, skew=self.refresh_skew)),
            "bearer_expires_at": session.expires_at if session else None,
            "seconds_to_expiry": (session.expires_at - now) if session else None,
            "revoked": self._revoked,
            "legacy_permanent_bearer_forbidden": True,
        }


_RUNTIME: IdentityRuntime | None = None


def get_runtime(**kwargs: Any) -> IdentityRuntime:
    global _RUNTIME
    if kwargs:
        _RUNTIME = IdentityRuntime(**kwargs)
        return _RUNTIME
    if _RUNTIME is None:
        _RUNTIME = IdentityRuntime()
    return _RUNTIME


def reset_runtime() -> None:
    global _RUNTIME
    _RUNTIME = None
