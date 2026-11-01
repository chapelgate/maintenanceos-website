# mos-1212-http-error-structure-cap
FEATURE: cap structured sanitize_http_detail payloads by JSON size

## What
Per-string detail is capped at HTTP_ERROR_DETAIL_MAX, but list/dict details can still expand to huge JSON bodies.

## Acceptance
- Structured details whose JSON encoding exceeds HTTP_ERROR_JSON_MAX collapse to {_truncated:true,size_limit}
- Existing http_error suites stay green
