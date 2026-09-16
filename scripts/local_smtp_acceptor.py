#!/usr/bin/env python3
"""Local authenticated SMTP acceptor for proving the application SMTP path.

Stores received messages under /tmp/mos-smtp-outbox as JSON. A companion
agent/process can relay them to the real inbox. This is real SMTP (not EMAIL_MODE=mock).
"""

from __future__ import annotations

import json
import os
import time
from email import message_from_bytes
from email.message import EmailMessage
from pathlib import Path

from aiosmtpd.controller import Controller
from aiosmtpd.smtp import AuthResult, LoginPassword

OUTBOX = Path(os.environ.get("MOS_SMTP_OUTBOX", "/tmp/mos-smtp-outbox"))
HOST = os.environ.get("MOS_SMTP_HOST", "127.0.0.1")
PORT = int(os.environ.get("MOS_SMTP_PORT", "2525"))
USER = os.environ.get("MOS_SMTP_USER", "mos-smtp")
PASSWORD = os.environ.get("MOS_SMTP_PASSWORD", "mos-smtp-test-password")


class Authenticator:
    def __call__(self, server, session, envelope, mechanism, auth_data):
        if not isinstance(auth_data, LoginPassword):
            return AuthResult(success=False, handled=False)
        login = auth_data.login.decode() if isinstance(auth_data.login, bytes) else auth_data.login
        password = auth_data.password.decode() if isinstance(auth_data.password, bytes) else auth_data.password
        if login == USER and password == PASSWORD:
            return AuthResult(success=True)
        return AuthResult(success=False, handled=True)


class Handler:
    async def handle_DATA(self, server, session, envelope):
        OUTBOX.mkdir(parents=True, exist_ok=True)
        msg = message_from_bytes(envelope.content)
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True) or b""
                    body = payload.decode(part.get_content_charset() or "utf-8", "replace")
                    break
        else:
            payload = msg.get_payload(decode=True)
            if isinstance(payload, bytes):
                body = payload.decode(msg.get_content_charset() or "utf-8", "replace")
            else:
                body = str(msg.get_payload() or "")
        payload = {
            "mail_from": envelope.mail_from,
            "rcpt_tos": list(envelope.rcpt_tos),
            "subject": msg.get("Subject", ""),
            "message_id": msg.get("Message-ID", ""),
            "body": body,
            "raw": envelope.content.decode("utf-8", "replace"),
        }
        path = OUTBOX / f"{len(list(OUTBOX.glob('*.json')))+1:04d}.json"
        path.write_text(json.dumps(payload, indent=2))
        print(f"SMTP_ACCEPTED {path}", flush=True)
        return "250 OK"


def main():
    OUTBOX.mkdir(parents=True, exist_ok=True)
    controller = Controller(
        Handler(),
        hostname=HOST,
        port=PORT,
        authenticator=Authenticator(),
        auth_required=True,
        auth_require_tls=False,
    )
    controller.start()
    print(f"SMTP_READY {HOST}:{PORT}", flush=True)
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        pass
    finally:
        controller.stop()


if __name__ == "__main__":
    main()
