# mos-1201-expect-ct-report-sink
FEATURE: Accept Expect-CT report-uri posts at /ct-err

## What
SECURITY_HEADERS advertise Expect-CT with report-uri=/ct-err, but no route handles those reports.

## Acceptance
- POST /ct-err accepts a JSON object (or empty body) and returns 204
- Emits operational_event("expect_ct_report", ...) with request_id/method/path/status only (no raw body)
- Non-object JSON returns 400 with sanitized detail
- GET /ct-err returns 405
- Existing security-header suites stay green
