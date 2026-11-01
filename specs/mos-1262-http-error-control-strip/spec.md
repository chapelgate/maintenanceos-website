# mos-1262-http-error-control-strip
FEATURE: strip C0 control characters from sanitized HTTP error text

## What
sanitize_http_detail redacts secrets but still echoes NUL/C0 bytes into client error bodies.

## Acceptance
- C0 controls (except tab/newline/carriage-return) stripped from string details
- nested dict/list string values stripped
- sanitize_json_payload strips controls
- existing redaction/truncation suites stay green
