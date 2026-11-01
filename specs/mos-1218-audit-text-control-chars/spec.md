# mos-1218-audit-text-control-chars
FEATURE: reject control characters in audit_text.redact_detail input

## What
redact_detail passes detail through to secret redaction without rejecting control characters.

## Acceptance
- Raise ValueError on control characters (except tab/newline/cr)
- Existing redaction behaviour stays
- Named acceptance test green
