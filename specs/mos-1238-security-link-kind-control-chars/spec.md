# mos-1238-security-link-kind-control-chars
FEATURE: reject control characters in security sign_link/verify_link kind

## What
sign_link and verify_link accept kind strings without control-char validation.

## Acceptance
- sign_link rejects control chars in kind
- verify_link rejects control chars in kind
- Existing security tests stay green
