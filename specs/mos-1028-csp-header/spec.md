# mos-1028-csp-header
## Goal
Lock Content-Security-Policy on HTTP responses via SECURITY_HEADERS.
## Acceptance
- SECURITY_HEADERS includes CSP default-src none / frame-ancestors none / base-uri none / form-action self
- /health carries the CSP header
- tests pass
