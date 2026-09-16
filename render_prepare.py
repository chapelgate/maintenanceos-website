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
from idempotency import set_ai_side_effects
from models import SessionLocal
from readiness import report as readiness_report

SYNTHETIC_READY = "SYNTHETIC_VOICE_TENANT_READY"
PREPARE_PASS = "RENDER_PREPARE_PASS"


def _record_fail_closed_side_effects() -> None:
    with SessionLocal() as session:
        set_ai_side_effects(
            session,
            False,
            actor="render-preflight",
            reason="Controlled test-call preflight: AI side effects remain disabled",
        )
        session.commit()


def prepare_runtime(*, twilio_updater=None) -> dict[str, object]:
    tenant_id = ensure_synthetic_tenant()
    _record_fail_closed_side_effects()
    webhook = configure_twilio_voice_webhook(twilio_updater=twilio_updater)
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
