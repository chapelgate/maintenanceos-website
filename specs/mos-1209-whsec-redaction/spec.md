# mos-1209-whsec-redaction
FEATURE: redact Stripe webhook signing secrets (whsec_) in shared secret patterns

## What
secret_patterns redacts Stripe secret/restricted keys but not webhook signing secrets shaped like whsec_.

## Acceptance
- redact_secrets replaces whsec_ values with [REDACTED]
- Existing secret redaction suites stay green
