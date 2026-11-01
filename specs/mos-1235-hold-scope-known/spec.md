# mos-1235-hold-scope-known
FEATURE: expose hold_scope_known and action_known helpers for lifecycle

## What
Callers cannot validate hold scope or action strings against the internal allowed sets without duplicating them.

## Acceptance
- hold_scope_known True only for _ALLOWED_HOLD_SCOPES
- action_known True only for _ALLOWED_ACTIONS
- Both reject control chars / empty
- Named acceptance test green
