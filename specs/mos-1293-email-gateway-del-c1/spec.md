# mos-1293-email-gateway-del-c1

## Goal
email_gateway._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- _sender_address / _resend_api_key / smtp_configured / live_email_enabled / pilot_resend_ready reject DEL and C1
- Existing C0 reject suite remains green
