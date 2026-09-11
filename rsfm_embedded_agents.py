"""Telemetry-only RSFM identities for MaintenanceOS embedded capabilities.

These logical agents share the MaintenanceOS host process but use separate RSFM
app identities and credentials. They cannot migrate authoritative data or grant
external action authority.
"""
from __future__ import annotations

import json
import os
import urllib.request
from typing import Any

_ALLOWED = {
    "ai-receptionist": "RSFM_AI_RECEPTIONIST_TOKEN",
    "email-admin-agent": "RSFM_EMAIL_ADMIN_AGENT_TOKEN",
}
_ALLOWED_CLASSES = {"memory", "control"}


def _config(app_id: str) -> tuple[str, str, str] | None:
    if app_id not in _ALLOWED or os.getenv("RSFM_INTEGRATION_ENABLED", "0") != "1":
        return None
    base = os.getenv("RSFM_CONTROL_PLANE_URL", "").rstrip("/")
    token = os.getenv(_ALLOWED[app_id], "").strip()
    tenant = os.getenv("RSFM_TENANT_ID", "chapelgate").strip()
    if not base or not token or not tenant:
        return None
    return base, token, tenant


def publish_record(app_id: str, record_class: str, kind: str, data: dict[str, Any], *, actor_id: str | None = None, idempotency_key: str | None = None) -> bool:
    if record_class not in _ALLOWED_CLASSES:
        return False
    cfg = _config(app_id)
    if cfg is None:
        return False
    base, token, tenant = cfg
    payload = json.dumps({
        "tenant_id": tenant,
        "app_id": app_id,
        "actor_id": actor_id or app_id,
        "record_class": record_class,
        "kind": kind,
        "data": data,
        "idempotency_key": idempotency_key,
    }).encode("utf-8")
    req = urllib.request.Request(base + "/v1/records", data=payload, method="POST", headers={
        "content-type": "application/json",
        "x-rsfm-token": token,
        "x-rsfm-app-id": app_id,
    })
    try:
        with urllib.request.urlopen(req, timeout=3) as response:
            return 200 <= response.status < 300
    except Exception:
        return False


def heartbeat(app_id: str, status: str, *, workflow_id: str | None = None) -> bool:
    return publish_record(app_id, "control", "agent.heartbeat", {"status": status, "workflow_id": workflow_id}, idempotency_key=f"heartbeat:{workflow_id}:{status}" if workflow_id else None)


def publish_memory(app_id: str, kind: str, data: dict[str, Any]) -> bool:
    return publish_record(app_id, "memory", kind, data)
