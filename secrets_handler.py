"""Universal Secrets Handler — load supported credentials without logging values.

Sources (first hit wins per key):
1. Process environment
2. MOS_SECRETS_DIR files (`/tmp/mos-secrets/<NAME>` by default)
3. Optional `.env` via python-dotenv (never committed secrets)

Never prints secret values. Presence/length only for diagnostics.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable

DEFAULT_SECRETS_DIR = Path(os.getenv("MOS_SECRETS_DIR", "/tmp/mos-secrets"))

# Keys the handler knows how to resolve for MaintenanceOS runtimes.
SUPPORTED_SECRET_NAMES: tuple[str, ...] = (
    "DIGITALOCEAN_TOKEN",
    "DIGITALOCEAN_ACCESS_TOKEN",
    "DO_API_TOKEN",
    "RENDER_API_KEY",
    "OPENAI_API_KEY",
    "CHAPELGATE_OPENAI_KEY",
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_FROM_NUMBER",
    "TWILIO_HUMAN_TRANSFER_NUMBER",
    "TWILIO_FROM_NUMBER_2",
    "RESEND_API_KEY",
    "SMTP_PASSWORD",
    "SMTP_USERNAME",
    "APP_SECRET",
    "INTERNAL_API_TOKEN",
    "INTERNAL_API_CLIENT_ID",
    "DATABASE_URL",
)

# Aliases: if primary missing, try these (same value meaning).
ALIASES: dict[str, tuple[str, ...]] = {
    "DIGITALOCEAN_TOKEN": ("DIGITALOCEAN_ACCESS_TOKEN", "DO_API_TOKEN"),
    "GEMINI_API_KEY": ("GOOGLE_API_KEY",),
    "OPENAI_API_KEY": ("CHAPELGATE_OPENAI_KEY",),
    "RESEND_API_KEY": (),  # SMTP_PASSWORD may be Resend re_ key — handled separately
}


def _read_file_secret(name: str, secrets_dir: Path) -> str:
    path = secrets_dir / name
    if not path.is_file():
        return ""
    try:
        return path.read_text(encoding="utf-8").strip()
    except OSError:
        return ""


def get_secret(name: str, *, secrets_dir: Path | None = None, load_dotenv: bool = True) -> str:
    """Return secret value or empty string. Never logs the value."""
    if load_dotenv:
        try:
            from dotenv import load_dotenv as _load

            _load(override=False)
        except Exception:
            pass
    value = (os.getenv(name) or "").strip()
    if value:
        return value
    root = secrets_dir or DEFAULT_SECRETS_DIR
    value = _read_file_secret(name, root)
    if value:
        os.environ[name] = value
        return value
    for alt in ALIASES.get(name, ()):
        value = (os.getenv(alt) or "").strip() or _read_file_secret(alt, root)
        if value:
            os.environ[name] = value
            return value
    # Resend HTTPS alias: SMTP_PASSWORD starting with re_
    if name == "RESEND_API_KEY":
        pw = (os.getenv("SMTP_PASSWORD") or "").strip() or _read_file_secret("SMTP_PASSWORD", root)
        user = (os.getenv("SMTP_USERNAME") or "").strip().casefold()
        if pw.startswith("re_") or user == "resend":
            os.environ["RESEND_API_KEY"] = pw
            return pw
    return ""


def require_secrets(names: Iterable[str], *, secrets_dir: Path | None = None) -> list[str]:
    """Load secrets into env. Return list of still-missing names."""
    missing: list[str] = []
    for name in names:
        if not get_secret(name, secrets_dir=secrets_dir):
            missing.append(name)
    return missing


def presence_map(names: Iterable[str] | None = None, *, secrets_dir: Path | None = None) -> dict[str, bool]:
    """Boolean-only presence report (safe to log/print)."""
    keys = tuple(names) if names is not None else SUPPORTED_SECRET_NAMES
    return {name: bool(get_secret(name, secrets_dir=secrets_dir)) for name in keys}


def digitalocean_token() -> str:
    return get_secret("DIGITALOCEAN_TOKEN")


def voice_provider_credentials_ready() -> dict[str, bool]:
    """Voice path does not require Resend."""
    openai = bool(get_secret("OPENAI_API_KEY"))
    gemini = bool(get_secret("GEMINI_API_KEY"))
    twilio = all(
        get_secret(k)
        for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER")
    )
    return {
        "openai_or_gemini": openai or gemini,
        "openai": openai,
        "gemini": gemini,
        "twilio_core": twilio,
        "resend_optional_for_voice": bool(get_secret("RESEND_API_KEY")),
        "digitalocean": bool(digitalocean_token()),
    }


if __name__ == "__main__":
    import json

    print(json.dumps({"presence": presence_map(), "voice": voice_provider_credentials_ready()}, indent=2))
