"""Send one real SMTP notification through the live application path.

Requires:
  EMAIL_MODE=imap_smtp
  ENABLE_LIVE_EMAIL=true
  SMTP_HOST / SMTP_USERNAME / SMTP_PASSWORD / SMTP_FROM
  INTERNAL_NOTIFICATION_EMAIL (defaults to chapelgate@gmail.com for this script)
"""

from __future__ import annotations

import os
import sys
import uuid

from dotenv import load_dotenv

load_dotenv()


def main() -> int:
    os.environ.setdefault("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    recipient = os.environ["INTERNAL_NOTIFICATION_EMAIL"].strip()
    if not recipient:
        print("REAL_SMTP_BLOCKED recipient_unconfigured")
        return 2

    from email_gateway import live_email_enabled, send_email, smtp_configured

    if not live_email_enabled():
        print("REAL_SMTP_BLOCKED live_email_disabled_or_mode")
        print(
            "Set EMAIL_MODE=imap_smtp and ENABLE_LIVE_EMAIL=true for the application path."
        )
        return 3
    if not smtp_configured():
        print("REAL_SMTP_BLOCKED smtp_configuration_incomplete")
        print("Missing one of SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM.")
        return 4

    marker = f"MOS-SMTP-TEST-{uuid.uuid4().hex[:12]}"
    subject = f"[REPAIR] MaintenanceOS SMTP path verification {marker}"
    body = (
        "REPAIR / MAINTENANCE REQUEST\n"
        "Category: repair\n"
        f"Job / reference: {marker}\n"
        "Caller name: SMTP Path Tester\n"
        "Callback number: not collected\n"
        "Caller address: not collected\n"
        "Area (Wirral/Sefton): Wirral\n"
        "Gate number: 99\n"
        "Fault / request: Synthetic SMTP verification only\n"
        "Urgency: not collected\n"
        "\n"
        "Concise call summary:\n"
        "Automated real SMTP delivery check through email_gateway.send_email.\n"
        "\n"
        "Transcript:\n"
        "Caller: This is a synthetic MaintenanceOS SMTP verification.\n"
    )
    result = send_email(recipient, subject, body)
    if result.get("mock"):
        print("REAL_SMTP_FAIL mock_response")
        return 5
    print("REAL_SMTP_SENT")
    print(f"marker={marker}")
    print(f"message_id_present={bool(result.get('message_id'))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
