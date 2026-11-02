1. Extend `_strip_controls` in http_error_text.py and secret_patterns.py to drop DEL and C1.
2. Keep tab/newline/CR; keep existing C0 strip and secret regex redaction.
3. Named acceptance tests for sanitize_http_detail, sanitize_json_payload, and redact_secrets.
