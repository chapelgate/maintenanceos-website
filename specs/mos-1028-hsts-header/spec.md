# mos-1028-hsts-header

## Goal
Lock Strict-Transport-Security max-age=31536000; includeSubDomains on every HTTP response.

## Acceptance
- SECURITY_HEADERS includes strict-transport-security
- /health carries the header
- tests/test_hsts_header.py and test_security_headers_lock.py pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
