# Spec: Form Stub CORS Hardening

## Objective
Replace wildcard CORS with explicit allow-list, add email redaction to stored leads, and enforce Vary: Origin.

## Acceptance Criteria
- ALLOWED_ORIGINS const with localhost:3000, 127.0.0.1:3000, worksmartos.co.uk
- corsHeaders returns empty ACAO for unlisted origins
- corsHeaders returns matching origin for listed origins
- POST /leads stores redacted email ([REDACTED]) in JSONL
- console.log never logs real email
- Vary: Origin header present on all responses
- FORM_STUB_CORS_ORIGIN env still overrides allow-list (highest precedence)

## Behavior Change
CORS origin list is explicit; wildcard removed. Stored leads redact emails. Test coverage added.
