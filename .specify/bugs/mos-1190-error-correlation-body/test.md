# Test — mos-1190

## Commands
```
python -m pytest tests/test_mos_1190_error_correlation_body.py tests/test_http_error_sanitize.py -q
```

## Verdict
verified when error JSON bodies expose correlation_id matching x-request-id and sanitization suites stay green.

## Result
verified — mos-1190 + http_error_sanitize + mos-1192 at 2026-10-31T20:03:32Z
