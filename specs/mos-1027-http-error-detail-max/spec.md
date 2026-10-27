# mos-1027-http-error-detail-max

## Goal
After secret redaction, clip HTTP error detail strings to 2000 characters so responses cannot carry unbounded text.

## Acceptance
- http_error_text.HTTP_ERROR_DETAIL_MAX == 2000
- sanitize_http_detail clips strings longer than the max after redaction
- non-string details are unchanged

## Out of scope
identity.py, voice, deploy, commercial runtime flags.
