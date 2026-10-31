# Plan
1. Expand secret_patterns.py with full token set + redact_secrets
2. Point audit_text / http_error_text / operational_logging at shared redactor
3. Preserve _redact sensitive-key short-circuit semantics
4. Lock with mos-1061 tests + redaction regressions
