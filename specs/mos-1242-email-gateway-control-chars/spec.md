# mos-1242-email-gateway-control-chars
FEATURE: reject control characters in email_gateway config/env values

## What
email_gateway reads SMTP/IMAP/Resend config from env without control-char validation.

## Acceptance
- _sender_address returns "" on control chars
- _resend_api_key returns "" on control chars
- smtp_configured/live_email_enabled/pilot_resend_ready return False on control chars
- email_gate_status safe
