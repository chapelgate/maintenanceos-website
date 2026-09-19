"""Twilio voice webhook configuration with fail-closed closed-mode behaviour.

Render/cloud build steps must not treat an intentional closed-ingress refusal as a
deployment error. When ENABLE_PUBLIC_PROVIDER_INGRESS is false, webhook mutation is
skipped and an explicit safe status is emitted. Unauthorised or incomplete live
configuration still fails closed.
"""

from __future__ import annotations

import os
import sys
from typing import Callable
from urllib.parse import urlsplit

from webhook_security import public_provider_ingress_ready

CLOSED_SKIP_STATUS = "TWILIO_VOICE_WEBHOOK_SKIPPED_CLOSED_MODE"
READY_STATUS = "TWILIO_VOICE_WEBHOOK_READY"
REFUSAL_MESSAGE = "Refusing Twilio webhook configuration: public provider ingress is not ready"
INBOUND_PATH = "/voice/inbound"
STATUS_PATH = "/voice/stream-status"


class ProviderWebhookError(RuntimeError):
    pass


def _enabled(name: str) -> bool:
    return os.getenv(name, "false").strip().lower() == "true"


def ingress_intentionally_closed() -> bool:
    return not _enabled("ENABLE_PUBLIC_PROVIDER_INGRESS")


def realtime_enabled() -> bool:
    return _enabled("ENABLE_REALTIME_VOICE")


def plan_twilio_voice_webhook() -> dict[str, bool]:
    closed = ingress_intentionally_closed()
    ready = public_provider_ingress_ready()
    return {
        "ingress_enabled": not closed,
        "realtime_enabled": realtime_enabled(),
        "public_provider_ingress_ready": ready,
        "should_skip_closed_mode": closed,
        "should_fail_closed": (not closed) and not ready,
        "should_configure": (not closed) and ready,
    }


def _voice_urls() -> tuple[str, str]:
    base = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")
    parsed = urlsplit(base)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ProviderWebhookError("public HTTPS origin is not ready")
    return f"{base}{INBOUND_PATH}", f"{base}{STATUS_PATH}"


def apply_twilio_incoming_phone_voice_url() -> None:
    """Mutate the dedicated Twilio test number. Callers must already be authorised."""
    if not public_provider_ingress_ready():
        raise ProviderWebhookError(REFUSAL_MESSAGE)
    from twilio.rest import Client

    sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    number = os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    if not sid or not token or not number:
        raise ProviderWebhookError("Twilio credentials are not ready")
    voice_url, status_url = _voice_urls()
    client = Client(sid, token)
    matches = client.incoming_phone_numbers.list(phone_number=number, limit=1)
    if not matches:
        raise ProviderWebhookError("dedicated test number was not found in the Twilio account")
    matches[0].update(
        voice_url=voice_url,
        voice_method="POST",
        status_callback=status_url,
        status_callback_method="POST",
    )


def configure_twilio_voice_webhook(
    *,
    twilio_updater: Callable[[], None] | None = None,
) -> dict[str, object]:
    plan = plan_twilio_voice_webhook()
    result: dict[str, object] = {
        **plan,
        "mutated": False,
        "status": "",
        "message": "",
    }
    if plan["should_skip_closed_mode"]:
        result["status"] = CLOSED_SKIP_STATUS
        result["message"] = REFUSAL_MESSAGE
        return result
    if plan["should_fail_closed"]:
        raise ProviderWebhookError(REFUSAL_MESSAGE)
    updater = twilio_updater or apply_twilio_incoming_phone_voice_url
    updater()
    result["mutated"] = True
    result["status"] = READY_STATUS
    result["message"] = READY_STATUS
    return result


def emit_webhook_status(result: dict[str, object], stream=None) -> None:
    out = stream or sys.stdout
    status = str(result.get("status") or "")
    message = str(result.get("message") or "")
    if message:
        print(message, file=out)
    if status and status != message:
        print(status, file=out)


def main(argv: list[str] | None = None) -> int:
    del argv
    try:
        result = configure_twilio_voice_webhook()
    except ProviderWebhookError as exc:
        print(str(exc), file=sys.stdout)
        return 1
    emit_webhook_status(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
