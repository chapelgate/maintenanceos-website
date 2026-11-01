# mos-1263-redact-secrets-control-strip
FEATURE: strip C0 controls in secret_patterns.redact_secrets

## What
Shared redactor left NUL/C0 in outputs used by ops logs and audit paths.

## Acceptance
- redact_secrets strips C0 except tab/newline/CR
- Bearer/email still redacted
- existing redaction suites stay green
