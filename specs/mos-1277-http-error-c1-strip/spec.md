# mos-1277-http-error-c1-strip

## Goal
HTTP error and shared secret redaction must strip DEL (U+007F) and C1 controls (U+0080–U+009F), matching input rejection in api._reject_control_chars, while keeping tab/newline/CR.

## Acceptance
- sanitize_http_detail strips DEL and C1
- sanitize_json_payload strips DEL and C1
- redact_secrets strips DEL and C1 after redaction
- Existing C0 strip + tab/newline keep behaviour remains green
