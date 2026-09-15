"""Render/cloud build preparation: synthetic tenant plus fail-closed Twilio webhook step."""

from __future__ import annotations

import sys

from provider_webhooks import (
    ProviderWebhookError,
    configure_twilio_voice_webhook,
    emit_webhook_status,
    plan_twilio_voice_webhook,
)
from seed_synthetic_tenant import ensure_synthetic_tenant

SYNTHETIC_READY = "SYNTHETIC_VOICE_TENANT_READY"
PREPARE_PASS = "RENDER_PREPARE_PASS"


def prepare_runtime(*, twilio_updater=None) -> dict[str, object]:
    tenant_id = ensure_synthetic_tenant()
    webhook = configure_twilio_voice_webhook(twilio_updater=twilio_updater)
    plan = plan_twilio_voice_webhook()
    return {
        "synthetic_voice_tenant_ready": True,
        "tenant_id_present": bool(tenant_id),
        "realtime_enabled": plan["realtime_enabled"],
        "ingress_enabled": plan["ingress_enabled"],
        "webhook": webhook,
        "prepare_passed": True,
    }


def main(argv: list[str] | None = None) -> int:
    del argv
    try:
        report = prepare_runtime()
    except ProviderWebhookError as exc:
        print(str(exc), file=sys.stdout)
        return 1
    print(SYNTHETIC_READY)
    emit_webhook_status(report["webhook"])
    print(PREPARE_PASS)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
