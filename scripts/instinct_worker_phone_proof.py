#!/usr/bin/env python3
"""Controlled Instinct-benchmark phone proof using the dedicated MOS test number.

Provider credentials come from environment only and are never printed.
Temporarily routes only the dedicated test number to Twilio demo TwiML,
places one controlled call, then restores the original webhook in finally.
"""
from __future__ import annotations

import hashlib
import json
import os
import time

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


def token_ref(value: str) -> str:
    return "sha256:" + hashlib.sha256((value or "").encode()).hexdigest()[:16]


def main() -> int:
    account = (os.getenv("TWILIO_ACCOUNT_SID") or "").strip()
    auth = (os.getenv("TWILIO_AUTH_TOKEN") or "").strip()
    target = (os.getenv("TWILIO_PHONE_NUMBER") or "").strip()
    candidates = [
        (os.getenv("TWILIO_FROM_NUMBER") or "").strip(),
        (os.getenv("TWILIO_HUMAN_TRANSFER_NUMBER") or "").strip(),
    ]
    source = next((x for x in candidates if x and x != target), "")
    if not account or not auth or not target:
        print(json.dumps({"PHONE_PROOF": "BLOCKED", "reason": "missing_existing_twilio_credentials"}))
        return 2
    if not source:
        print(json.dumps({"PHONE_PROOF": "BLOCKED", "reason": "no_distinct_existing_from_number"}))
        return 3

    client = Client(account, auth)
    matches = client.incoming_phone_numbers.list(phone_number=target, limit=10)
    exact = next((x for x in matches if (x.phone_number or "").strip() == target), None)
    if exact is None:
        print(json.dumps({"PHONE_PROOF": "BLOCKED", "reason": "dedicated_test_number_not_found"}))
        return 4

    original_url = exact.voice_url or ""
    original_method = exact.voice_method or "POST"
    call = None
    final_status = ""
    restored = False
    provider_error = None
    try:
        exact.update(voice_url="https://demo.twilio.com/docs/voice.xml", voice_method="GET")
        try:
            call = client.calls.create(
                to=target,
                from_=source,
                url="https://demo.twilio.com/docs/voice.xml",
                method="GET",
                timeout=20,
            )
        except TwilioRestException as exc:
            provider_error = {"type": "TwilioRestException", "status": exc.status, "code": exc.code}
        except Exception as exc:
            provider_error = {"type": exc.__class__.__name__}
        if call is None:
            return_code = 5
        else:
            return_code = 0
        deadline = time.time() + 70
        while call is not None and time.time() < deadline:
            current = client.calls(call.sid).fetch()
            final_status = (current.status or "").lower()
            if final_status in {"completed", "busy", "failed", "no-answer", "canceled"}:
                break
            time.sleep(2)
        if call is not None and final_status not in {"completed", "busy", "failed", "no-answer", "canceled"}:
            try:
                client.calls(call.sid).update(status="completed")
            except Exception:
                pass
            current = client.calls(call.sid).fetch()
            final_status = (current.status or "").lower()
    finally:
        exact.update(voice_url=original_url, voice_method=original_method)
        check = client.incoming_phone_numbers(exact.sid).fetch()
        restored = (check.voice_url or "") == original_url and (check.voice_method or "POST") == original_method

    accepted = bool(call and getattr(call, "sid", None))
    passed = accepted and final_status == "completed" and restored
    print(json.dumps({
        "PHONE_PROOF": "PASS" if passed else "FAIL",
        "provider": "twilio",
        "real_call_resource_created": accepted,
        "terminal_status": final_status,
        "test_number_ref": token_ref(target),
        "from_number_ref": token_ref(source),
        "call_ref": token_ref(call.sid if call else ""),
        "test_number_webhook_restored": restored,
        "render_used": False,
        "golden_line_touched": False,
        "secret_values_logged": False,
        "provider_error": provider_error,
    }, sort_keys=True))
    return 0 if passed else (return_code if provider_error else 1)


if __name__ == "__main__":
    raise SystemExit(main())
