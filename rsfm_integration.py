from __future__ import annotations

import http.client
import json
import os
import urllib.parse
from typing import Any

APP_ID = "maintenanceos"


def _config() -> tuple[str, str, str] | None:
    if os.environ.get("RSFM_INTEGRATION_ENABLED", "0") != "1":
        return None
    base_url = os.environ.get("RSFM_CONTROL_PLANE_URL", "").strip()
    token = os.environ.get("RSFM_CONTROL_PLANE_TOKEN", "").strip()
    tenant = os.environ.get("RSFM_TENANT_ID", "chapelgate").strip()
    if not base_url or not token or not tenant:
        return None
    return base_url, token, tenant


def publish_control_event(kind: str, data: dict[str, Any], *, actor_id: str = "maintenanceos",
                          idempotency_key: str | None = None) -> bool:
    """Additive metadata publication only; MaintenanceOS remains authoritative."""
    cfg = _config()
    if cfg is None:
        return False
    base_url, token, tenant = cfg
    parsed = urllib.parse.urlsplit(base_url)
    if parsed.scheme not in {"https", "http"} or not parsed.hostname:
        return False
    target = parsed.path.rstrip("/") + "/v1/records"
    payload = json.dumps({
        "tenant_id": tenant,
        "app_id": APP_ID,
        "actor_id": actor_id,
        "record_class": "control",
        "kind": kind,
        "data": data,
        "idempotency_key": idempotency_key,
    }, separators=(",", ":")).encode("utf-8")
    conn_cls = http.client.HTTPSConnection if parsed.scheme == "https" else http.client.HTTPConnection
    conn = conn_cls(parsed.hostname, parsed.port or (443 if parsed.scheme == "https" else 80), timeout=3)
    try:
        conn.request("POST", target, body=payload,
                     headers={"content-type": "application/json", "x-rsfm-token": token,
                              "x-rsfm-app-id": APP_ID})
        response = conn.getresponse()
        response.read()
        return 200 <= response.status < 300
    except (OSError, http.client.HTTPException):
        return False
    finally:
        conn.close()
