# mos-1236-secret-key-known
FEATURE: expose secret_key_known helper for SENSITIVE_KEY pattern

## What
Callers cannot tell if a field name matches the SENSITIVE_KEY pattern without importing and running the regex.

## Acceptance
- secret_key_known True for SENSITIVE_KEY-matching names
- False for empty/unknown/control-char names
- Named acceptance test green
