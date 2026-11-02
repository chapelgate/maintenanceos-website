# test.md — mos-1277-http-error-c1-strip

verdict: verified

Command:
```
python -m pytest tests/test_mos_1277_http_error_c1_strip.py tests/test_mos_1262_http_error_control_strip.py tests/test_mos_1263_redact_secrets_control_strip.py tests/test_http_error_sanitize.py -v --tb=short
```

Result: 15 passed (2026-11-02).
