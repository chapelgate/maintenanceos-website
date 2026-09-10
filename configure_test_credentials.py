"""Hidden, local-only entry for isolated voice test credentials."""

from __future__ import annotations

import argparse
import getpass
import json
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
from typing import Callable, TextIO

from dotenv import dotenv_values


ENV_PATH = Path(__file__).with_name(".env")
CREDENTIAL_KEYS = (
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_HUMAN_TRANSFER_NUMBER",
    "OPENAI_API_KEY",
)
FIELD_LABELS = {
    "TWILIO_ACCOUNT_SID": "Twilio test-account SID",
    "TWILIO_AUTH_TOKEN": "Twilio test-account auth token",
    "TWILIO_PHONE_NUMBER": "dedicated Twilio test number",
    "TWILIO_HUMAN_TRANSFER_NUMBER": "staffed human transfer number",
    "OPENAI_API_KEY": "OpenAI test-project API key",
}
REPORT_KEYS = {
    "TWILIO_ACCOUNT_SID": "twilio_test_account_sid",
    "TWILIO_AUTH_TOKEN": "twilio_test_account_auth_token",
    "TWILIO_PHONE_NUMBER": "dedicated_twilio_test_number",
    "TWILIO_HUMAN_TRANSFER_NUMBER": "human_transfer_number",
    "OPENAI_API_KEY": "openai_test_project_key",
}
PROTECTED_KEYS = (
    "APP_SECRET",
    "INTERNAL_API_TOKEN",
    "VOICE_TEST_CLIENT_ID",
    "INTERNAL_API_CLIENT_ID",
    "VOICE_TENANT_MODE",
)
SAFETY_VALUES = {
    "ENABLE_REALTIME_VOICE": "false",
    "VERIFY_TWILIO_SIGNATURES": "false",
    "ENABLE_PUBLIC_PROVIDER_INGRESS": "false",
    "ENABLE_CONTRACTOR_PORTAL": "false",
    "ENABLE_LIVE_EMAIL": "false",
    "ENABLE_LIVE_MESSAGING": "false",
    "ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE": "false",
    "DEFAULT_AUTO_DISPATCH_LIMIT": "0",
    "ENABLE_STRUCTURED_LOGGING": "true",
    "PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE": "120",
    "PUBLIC_WS_RATE_LIMIT_PER_MINUTE": "60",
}
CONFIRMATION = "DEDICATED TEST ONLY"
TEST_NUMBER_CONFIRMATION_KEY = "TWILIO_TEST_NUMBER_CONFIRMED"
_KEY_LINE = re.compile(r"^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=")
_ACCOUNT_SID = re.compile(r"^AC[0-9a-fA-F]{32}$")
_E164 = re.compile(r"^\+[1-9][0-9]{7,14}$")


class CredentialEntryError(ValueError):
    pass


def _present(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _valid_no_whitespace(value: str, minimum: int) -> bool:
    return len(value) >= minimum and not any(character.isspace() for character in value)


def validate_credentials(values: dict[str, str]) -> dict[str, bool]:
    checks = {
        "twilio_account_sid": bool(_ACCOUNT_SID.fullmatch(values.get("TWILIO_ACCOUNT_SID", ""))),
        "twilio_auth_token": _valid_no_whitespace(values.get("TWILIO_AUTH_TOKEN", ""), 32),
        "twilio_phone_number": bool(_E164.fullmatch(values.get("TWILIO_PHONE_NUMBER", ""))),
        "human_transfer_number": bool(
            _E164.fullmatch(values.get("TWILIO_HUMAN_TRANSFER_NUMBER", ""))
        ),
        "openai_api_key": (
            values.get("OPENAI_API_KEY", "").startswith("sk-")
            and _valid_no_whitespace(values.get("OPENAI_API_KEY", ""), 20)
        ),
    }
    checks["distinct_transfer_number"] = bool(
        checks["twilio_phone_number"]
        and checks["human_transfer_number"]
        and values["TWILIO_PHONE_NUMBER"] != values["TWILIO_HUMAN_TRANSFER_NUMBER"]
    )
    return checks


def _field_error(key: str, values: dict[str, str]) -> str | None:
    value = values.get(key, "")
    label = FIELD_LABELS[key]
    if not _present(value):
        return f"{label} is missing"
    if key == "TWILIO_ACCOUNT_SID" and not _ACCOUNT_SID.fullmatch(value):
        return "Twilio test-account SID must start with AC followed by 32 hexadecimal characters"
    if key == "TWILIO_AUTH_TOKEN" and not _valid_no_whitespace(value, 32):
        return "Twilio test-account auth token must be a non-whitespace credential"
    if key in {"TWILIO_PHONE_NUMBER", "TWILIO_HUMAN_TRANSFER_NUMBER"} and not _E164.fullmatch(value):
        return f"{label} must use E.164 format, for example +442012345678, with no spaces or dashes"
    if key == "OPENAI_API_KEY" and not (
        value.startswith("sk-") and _valid_no_whitespace(value, 20)
    ):
        return "OpenAI test-project API key must start with sk- and contain no whitespace"
    if (
        key == "TWILIO_HUMAN_TRANSFER_NUMBER"
        and value == values.get("TWILIO_PHONE_NUMBER")
    ):
        return (
            "The staffed human transfer number must differ from the dedicated Twilio test number; "
            "using the same number could transfer a caller back into MaintenanceOS"
        )
    return None


def _required_setting_status(values: dict[str, str]) -> dict[str, str]:
    confirmed = values.get(TEST_NUMBER_CONFIRMATION_KEY, "").lower() == "true"
    statuses: dict[str, str] = {}
    for key in CREDENTIAL_KEYS:
        if not _present(values.get(key)):
            status = "missing"
        elif _field_error(key, values):
            status = "present_invalid"
        elif key == "TWILIO_PHONE_NUMBER" and not confirmed:
            status = "present_unconfirmed"
        else:
            status = "present_valid"
        statuses[REPORT_KEYS[key]] = status
    return statuses


def _read_values(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise CredentialEntryError("The project .env file does not exist")
    return {key: value or "" for key, value in dotenv_values(path).items()}


def credential_report(path: Path = ENV_PATH) -> dict[str, object]:
    values = _read_values(path)
    presence = {key.lower(): _present(values.get(key)) for key in CREDENTIAL_KEYS}
    formats = validate_credentials({key: str(values.get(key, "")) for key in CREDENTIAL_KEYS})
    controls = {
        "realtime_voice_disabled": values.get("ENABLE_REALTIME_VOICE", "").lower() == "false",
        "twilio_signatures_disabled": (
            values.get("VERIFY_TWILIO_SIGNATURES", "").lower() == "false"
        ),
        "public_provider_ingress_disabled": (
            values.get("ENABLE_PUBLIC_PROVIDER_INGRESS", "").lower() == "false"
        ),
        "contractor_portal_disabled": (
            values.get("ENABLE_CONTRACTOR_PORTAL", "").lower() == "false"
        ),
        "live_email_disabled": values.get("ENABLE_LIVE_EMAIL", "").lower() == "false",
        "live_messaging_disabled": values.get("ENABLE_LIVE_MESSAGING", "").lower() == "false",
        "remote_ai_enable_disabled": (
            values.get("ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE", "").lower() == "false"
        ),
        "automatic_dispatch_disabled": values.get("DEFAULT_AUTO_DISPATCH_LIMIT", "") == "0",
        "structured_logging_enabled": (
            values.get("ENABLE_STRUCTURED_LOGGING", "").lower() == "true"
        ),
        "ingress_limits_present": all(
            values.get(key, "").isdigit()
            for key in ("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", "PUBLIC_WS_RATE_LIMIT_PER_MINUTE")
        ),
        "tenant_ids_present": all(
            _present(values.get(key)) for key in ("VOICE_TEST_CLIENT_ID", "INTERNAL_API_CLIENT_ID")
        ),
        "existing_security_secrets_present": all(
            _present(values.get(key)) for key in ("APP_SECRET", "INTERNAL_API_TOKEN")
        ),
        "isolated_voice_tenant_mode": values.get("VOICE_TENANT_MODE") == "isolated_test",
        "dedicated_test_number_confirmed": (
            values.get(TEST_NUMBER_CONFIRMATION_KEY, "").lower() == "true"
        ),
    }
    return {
        "required_settings": _required_setting_status(values),
        "credential_presence": presence,
        "credential_format_valid": formats,
        "safety_controls": controls,
        "ready_for_provider_connectivity_checks": (
            all(presence.values()) and all(formats.values()) and all(controls.values())
        ),
    }


def _replace_values_atomically(path: Path, replacements: dict[str, str]) -> None:
    raw = path.read_bytes()
    text = raw.decode("utf-8")
    newline = "\r\n" if "\r\n" in text else "\n"
    trailing_newline = text.endswith(("\r", "\n"))
    lines = text.splitlines()
    seen: set[str] = set()
    output: list[str] = []
    for line in lines:
        match = _KEY_LINE.match(line)
        key = match.group(1) if match else ""
        if key in replacements:
            if key in seen:
                raise CredentialEntryError(f"Duplicate {key} entry in .env")
            output.append(f"{key}={replacements[key]}")
            seen.add(key)
        else:
            output.append(line)
    for key, value in replacements.items():
        if key not in seen:
            output.append(f"{key}={value}")
    encoded = (newline.join(output) + (newline if trailing_newline else "")).encode("utf-8")

    descriptor, temporary_name = tempfile.mkstemp(prefix=".env.", suffix=".tmp", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(encoded)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, stat.S_IMODE(path.stat().st_mode))
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def enter_credentials(
    path: Path = ENV_PATH,
    *,
    secret_reader: Callable[[str], str] = getpass.getpass,
    confirmation_reader: Callable[[str], str] = input,
    diagnostics: TextIO | None = None,
) -> dict[str, object]:
    before = _read_values(path)
    diagnostics = diagnostics or sys.stderr
    protected_before = {key: before.get(key) for key in PROTECTED_KEYS}
    _replace_values_atomically(path, SAFETY_VALUES)
    working = _read_values(path)

    for key in CREDENTIAL_KEYS:
        if _field_error(key, working) is None:
            continue
        while True:
            entered = secret_reader(f"Enter {FIELD_LABELS[key]} (hidden): ").strip()
            candidate = dict(working)
            candidate[key] = entered
            error = _field_error(key, candidate)
            if error:
                print(f"ERROR: {error}. Try this field again or press Ctrl+C to stop.", file=diagnostics)
                continue
            if key == "TWILIO_PHONE_NUMBER":
                while True:
                    confirmation = confirmation_reader(
                        f"Type {CONFIRMATION} to confirm this is the dedicated test number, not the live business number: "
                    )
                    if confirmation.strip() == CONFIRMATION:
                        break
                    print(
                        "ERROR: The dedicated test-number confirmation did not match. "
                        "The number has not been saved; try again or press Ctrl+C to stop.",
                        file=diagnostics,
                    )
            replacements = {key: entered, **SAFETY_VALUES}
            if key == "TWILIO_PHONE_NUMBER":
                replacements[TEST_NUMBER_CONFIRMATION_KEY] = "true"
            _replace_values_atomically(path, replacements)
            working = _read_values(path)
            break

    if (
        _field_error("TWILIO_PHONE_NUMBER", working) is None
        and working.get(TEST_NUMBER_CONFIRMATION_KEY, "").lower() != "true"
    ):
        while True:
            confirmation = confirmation_reader(
                f"Type {CONFIRMATION} to confirm the stored Twilio number is the dedicated test number, not the live business number: "
            )
            if confirmation.strip() == CONFIRMATION:
                _replace_values_atomically(
                    path, {TEST_NUMBER_CONFIRMATION_KEY: "true", **SAFETY_VALUES}
                )
                working = _read_values(path)
                break
            print(
                "ERROR: The dedicated test-number confirmation did not match. "
                "Try again or press Ctrl+C to stop.",
                file=diagnostics,
            )

    after = _read_values(path)
    protected_preserved = all(after.get(key) == value for key, value in protected_before.items())
    if not protected_preserved:
        raise CredentialEntryError("A protected tenant or security setting changed")

    report = credential_report(path)
    report["protected_settings_preserved"] = True
    report["credentials_written"] = True
    return report


def main(
    argv: list[str] | None = None,
    *,
    env_path: Path = ENV_PATH,
    secret_reader: Callable[[str], str] | None = None,
    confirmation_reader: Callable[[str], str] | None = None,
    stdout: TextIO | None = None,
    stderr: TextIO | None = None,
) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Print boolean-only credential readiness")
    arguments = parser.parse_args(argv)
    stdout = stdout or sys.stdout
    stderr = stderr or sys.stderr
    try:
        if arguments.check:
            report = credential_report(env_path)
        else:
            if secret_reader is None and (not sys.stdin.isatty() or not sys.stderr.isatty()):
                raise CredentialEntryError("Interactive entry requires a local terminal")
            current = credential_report(env_path)
            print("Current required-setting status (credential values are never shown):", file=stdout)
            print(json.dumps(current["required_settings"], indent=2, sort_keys=True), file=stdout)
            print(
                "The dedicated Twilio test number is the number whose blank inbound webhook may "
                "later be configured for MaintenanceOS testing.",
                file=stdout,
            )
            print(
                "The staffed human transfer number is the separate destination used when automation "
                "fails or a caller requests a person. These numbers must be different to prevent a "
                "transfer loop.",
                file=stdout,
            )
            report = enter_credentials(
                env_path,
                secret_reader=secret_reader or getpass.getpass,
                confirmation_reader=confirmation_reader or input,
                diagnostics=stderr,
            )
        print(json.dumps(report, indent=2, sort_keys=True), file=stdout)
        return 0 if report["ready_for_provider_connectivity_checks"] else 1
    except (EOFError, KeyboardInterrupt):
        print(
            "Entry cancelled. Any previously accepted settings remain saved, and all exposure "
            "controls remain disabled.",
            file=stderr,
        )
        return 130
    except CredentialEntryError as error:
        print(f"ERROR: {error}", file=stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
