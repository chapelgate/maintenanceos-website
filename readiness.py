"""Boolean-only readiness reporting. No setting values are emitted."""

from __future__ import annotations

import argparse
import json
import os
import sys

from dotenv import load_dotenv

from configure_test_credentials import validate_credentials
from idempotency import ai_side_effects_enabled
from ingress_security import rate_setting_valid
from models import RuntimeControl,SessionLocal
from operational_logging import structured_logging_enabled
from provider_runtime import provider_ready, voice_provider
from gemini_voice import gemini_ready
from security import app_secret_ready
from schema_health import schema_report
from tenant_security import internal_api_tenant_ready,isolated_voice_tenant_ready
from voice_bridge import realtime_model_supported,realtime_voice_supported,transcription_model_supported
from webhook_security import dedicated_test_number_ready,public_https_origin_ready,public_provider_ingress_ready

load_dotenv()


def _enabled(name: str) -> bool:
    return os.getenv(name, "false").strip().lower() == "true"


def _disabled(name: str) -> bool:
    return not _enabled(name)


def _provider_selected() -> bool:
    return voice_provider() in {"openai", "gemini"}


def _provider_credential_ready() -> bool:
    provider = voice_provider()
    if provider == "gemini":
        return gemini_ready()
    if provider == "openai":
        return bool(os.getenv("OPENAI_API_KEY"))
    return False


def _provider_runtime_supported() -> bool:
    provider = voice_provider()
    if provider == "gemini":
        return gemini_ready()
    if provider == "openai":
        return bool(realtime_model_supported() and transcription_model_supported() and realtime_voice_supported())
    return False


def _credential_formats_valid() -> bool:
    base = {
        key: os.getenv(key, "")
        for key in (
            "TWILIO_ACCOUNT_SID",
            "TWILIO_AUTH_TOKEN",
            "TWILIO_PHONE_NUMBER",
            "TWILIO_HUMAN_TRANSFER_NUMBER",
        )
    }
    checks = validate_credentials(base)
    if not all(checks.values()):
        return False
    provider = voice_provider()
    if provider == "gemini":
        return gemini_ready()
    if provider == "openai":
        openai_checks = validate_credentials({"OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", "")})
        return all(openai_checks.values())
    return False


def _kill_switch_recorded_disabled() -> bool:
    try:
        with SessionLocal() as session:
            control = session.get(RuntimeControl, "AI_SIDE_EFFECTS")
            return bool(control and not control.enabled and (control.updated_by or "").strip() and (control.reason or "").strip())
    except Exception:
        return False


def _kill_switch_effective() -> bool:
    try:
        with SessionLocal() as session:
            return not ai_side_effects_enabled(session)
    except Exception:
        return False


def _voice_timing_valid() -> bool:
    try:
        grace = float(os.getenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "1.0"))
        timeout = float(os.getenv("VOICE_TRANSCRIPTION_TIMEOUT_SECONDS", "5.0"))
        return 0 <= grace <= 3 and 1 <= timeout <= 15
    except (TypeError, ValueError):
        return False


def _staged_database_configured() -> bool:
    url = os.getenv("DATABASE_URL", "").strip().lower()
    return bool(url.startswith(("postgresql://", "postgresql+psycopg://")) and os.getenv("DATABASE_DEPLOYMENT_MODE", "").strip().lower() == "managed_test" and _enabled("DATABASE_TLS_REQUIRED"))


CHECKS={
    "database": lambda: schema_report()["database_reachable"],
    "schema_compatible": lambda: schema_report()["schema_compatible"],
    "app_secret_changed": app_secret_ready,
    "internal_api_secured": lambda: len(os.getenv("INTERNAL_API_TOKEN", "")) >= 32,
    "internal_api_tenant": internal_api_tenant_ready,
    "ai_provider_selected": _provider_selected,
    "ai_provider_credential": _provider_credential_ready,
    "ai_provider_runtime": _provider_runtime_supported,
    "openai_key": lambda: bool(os.getenv("OPENAI_API_KEY")),
    "openai_realtime_model": realtime_model_supported,
    "openai_transcription_model": transcription_model_supported,
    "openai_realtime_voice": realtime_voice_supported,
    "gemini_key": gemini_ready,
    "provider_credential_formats": _credential_formats_valid,
    "public_https_url": public_https_origin_ready,
    "twilio_sid": lambda: bool(os.getenv("TWILIO_ACCOUNT_SID")),
    "twilio_token": lambda: bool(os.getenv("TWILIO_AUTH_TOKEN")),
    "twilio_number": lambda: bool(os.getenv("TWILIO_PHONE_NUMBER")),
    "human_transfer_number": lambda: bool(os.getenv("TWILIO_HUMAN_TRANSFER_NUMBER")),
    "dedicated_test_number": dedicated_test_number_ready,
    "mail_inbound": lambda: bool(os.getenv("IMAP_HOST") and os.getenv("IMAP_USERNAME") and os.getenv("IMAP_PASSWORD")),
    "mail_outbound": lambda: bool(os.getenv("SMTP_HOST") and os.getenv("SMTP_USERNAME") and os.getenv("SMTP_PASSWORD")),
    "twilio_signatures": lambda: _enabled("VERIFY_TWILIO_SIGNATURES"),
    "realtime_voice_enabled": lambda: _enabled("ENABLE_REALTIME_VOICE"),
    "isolated_voice_tenant": isolated_voice_tenant_ready,
    "public_provider_ingress": public_provider_ingress_ready,
    "public_provider_ingress_disabled": lambda: _disabled("ENABLE_PUBLIC_PROVIDER_INGRESS"),
    "contractor_portal_disabled": lambda: _disabled("ENABLE_CONTRACTOR_PORTAL"),
    "live_email_disabled": lambda: _disabled("ENABLE_LIVE_EMAIL"),
    "live_messaging_disabled": lambda: _disabled("ENABLE_LIVE_MESSAGING"),
    "automatic_dispatch_disabled": lambda: os.getenv("DEFAULT_AUTO_DISPATCH_LIMIT", "") == "0",
    "remote_ai_enable_disabled": lambda: _disabled("ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE"),
    "ai_side_effects_disabled": _kill_switch_effective,
    "ai_kill_switch_recorded": _kill_switch_recorded_disabled,
    "structured_logging": structured_logging_enabled,
    "http_rate_limit_configured": lambda: rate_setting_valid("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE"),
    "websocket_rate_limit_configured": lambda: rate_setting_valid("PUBLIC_WS_RATE_LIMIT_PER_MINUTE"),
    "voice_timing_configured": _voice_timing_valid,
    "staged_database_configured": _staged_database_configured,
}

LOCAL_CLOSED_KEYS = (
    "database","schema_compatible","app_secret_changed","internal_api_secured",
    "internal_api_tenant","isolated_voice_tenant","ai_provider_selected","ai_provider_credential",
    "ai_provider_runtime","provider_credential_formats","dedicated_test_number",
    "public_provider_ingress_disabled","contractor_portal_disabled","live_email_disabled",
    "live_messaging_disabled","automatic_dispatch_disabled","remote_ai_enable_disabled",
    "ai_side_effects_disabled","ai_kill_switch_recorded","structured_logging",
    "http_rate_limit_configured","websocket_rate_limit_configured","voice_timing_configured",
)
PUBLIC_TEST_CONFIG_KEYS = (
    "database","schema_compatible","staged_database_configured","app_secret_changed",
    "internal_api_secured","internal_api_tenant","isolated_voice_tenant","ai_provider_selected",
    "ai_provider_credential","ai_provider_runtime","provider_credential_formats","dedicated_test_number",
    "public_https_url","twilio_signatures","public_provider_ingress","contractor_portal_disabled",
    "live_email_disabled","live_messaging_disabled","automatic_dispatch_disabled",
    "remote_ai_enable_disabled","ai_side_effects_disabled","ai_kill_switch_recorded",
    "structured_logging","http_rate_limit_configured","websocket_rate_limit_configured",
    "voice_timing_configured",
)


def report():
    results={}
    for key,check in CHECKS.items():
        try:results[key]=bool(check())
        except Exception:results[key]=False
    results["voice_ready"]=provider_ready()
    results["local_pre_live_ready"]=all(results[key] for key in LOCAL_CLOSED_KEYS)
    results["public_test_config_ready"]=all(results[key] for key in PUBLIC_TEST_CONFIG_KEYS) and not results["realtime_voice_enabled"]
    results["controlled_call_config_ready"]=all(results[key] for key in PUBLIC_TEST_CONFIG_KEYS) and results["voice_ready"]
    results["live_ready"]=results["controlled_call_config_ready"]
    return results

PROFILE_KEYS = {
    "local-closed": "local_pre_live_ready",
    "public-test-config": "public_test_config_ready",
    "controlled-call-config": "controlled_call_config_ready",
}

if __name__=="__main__":
    parser=argparse.ArgumentParser(description="Emit boolean-only MaintenanceOS readiness")
    parser.add_argument("--profile",choices=PROFILE_KEYS)
    args=parser.parse_args()
    result=report()
    if args.profile:
        ready_key=PROFILE_KEYS[args.profile]
        payload={"profile":args.profile,"ready":result[ready_key],"checks":result}
        print(json.dumps(payload,indent=2,sort_keys=True))
        sys.exit(0 if result[ready_key] else 1)
    print(json.dumps(result,indent=2,sort_keys=True))
