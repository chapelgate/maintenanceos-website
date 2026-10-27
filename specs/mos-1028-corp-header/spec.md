# mos-1028-corp-header
## Goal
Lock Cross-Origin-Resource-Policy same-origin on HTTP responses via SECURITY_HEADERS.
## Acceptance
- SECURITY_HEADERS includes cross-origin-resource-policy: same-origin
- /health carries the CORP header
- tests pass
