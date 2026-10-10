"""Render/cloud build preparation: synthetic tenant plus fail-closed Twilio webhook step."""

from __future__ import annotations

import os
import sys

from idempotency import set_ai_side_effects
from models import SessionLocal
from provider_webhooks import (
    ProviderWebhookError,
    configure_phone_voice_webhook,
    emit_webhook_status,
    plan_twilio_voice_webhook,
)
from readiness import report as readiness_report
from seed_synthetic_tenant import ensure_synthetic_tenant

SYNTHETIC_READY = "SYNTHETIC_VOICE_TENANT_READY"
PREPARE_PASS = "RENDER_PREPARE_PASS"
# Startup must never change live phone routing by default. Reconfiguring the
# carrier voice webhook on every service start is opt-in only; the explicit,
# operator-run path remains `python provider_webhooks.py`.
STARTUP_WEBHOOK_FLAG = "ENABLE_STARTUP_TWILIO_WEBHOOK_CONFIG"
STARTUP_WEBHOOK_SKIP_STATUS = "TWILIO_VOICE_WEBHOOK_SKIPPED_STARTUP_OPT_IN_DISABLED"
STARTUP_WEBHOOK_SKIP_MESSAGE = (
    "Startup Twilio webhook configuration is disabled "
    f"({STARTUP_WEBHOOK_FLAG} is not true); phone routing left unchanged"
)


def _record_fail_closed_side_effects() -> None:
    with SessionLocal() as session:
        set_ai_side_effects(
            session,
            False,
            actor="render-preflight",
            reason="Controlled test-call preflight: AI side effects remain disabled",
        )
        session.commit()


def startup_webhook_config_enabled() -> bool:
    return os.getenv(STARTUP_WEBHOOK_FLAG, "false").strip().lower() == "true"


def _startup_webhook(twilio_updater=None) -> dict[str, object]:
    if not startup_webhook_config_enabled():
        return {
            "mutated": False,
            "startup_opt_in": False,
            "status": STARTUP_WEBHOOK_SKIP_STATUS,
            "message": STARTUP_WEBHOOK_SKIP_MESSAGE,
        }
    result = configure_phone_voice_webhook(provider_updater=twilio_updater)
    return {**result, "startup_opt_in": True}


def prepare_runtime(*, twilio_updater=None) -> dict[str, object]:
    tenant_id = ensure_synthetic_tenant()
    _record_fail_closed_side_effects()
    webhook = _startup_webhook(twilio_updater)
    plan = plan_twilio_voice_webhook()
    readiness = readiness_report()
    return {
        "synthetic_voice_tenant_ready": True,
        "tenant_id_present": bool(tenant_id),
        "realtime_enabled": plan["realtime_enabled"],
        "ingress_enabled": plan["ingress_enabled"],
        "public_test_config_ready": bool(readiness["public_test_config_ready"]),
        "controlled_call_config_ready": bool(readiness["controlled_call_config_ready"]),
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
    print(f"PUBLIC_TEST_CONFIG_READY={str(report['public_test_config_ready']).lower()}")
    print(f"CONTROLLED_CALL_CONFIG_READY={str(report['controlled_call_config_ready']).lower()}")
    print(PREPARE_PASS)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
