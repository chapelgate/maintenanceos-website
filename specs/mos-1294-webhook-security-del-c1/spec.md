# mos-1294-webhook-security-del-c1

## Goal
webhook_security._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- validate_twilio / validate_twilio_websocket reject DEL and C1 in URL and signature
- Existing C0 reject suite remains green
