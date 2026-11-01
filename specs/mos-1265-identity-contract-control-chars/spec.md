# mos-1265-identity-contract-control-chars
FEATURE: fail closed on C0 controls in identity_contract authorize_identity

## What
issuer/subject/session_id/roles/assurance accepted control bytes into audit_context.

## Acceptance
- control-char issuer/subject -> principal_identity_control_chars
- control-char session_id -> session_control_chars
- control-char roles/assurance -> dedicated deny reasons
- clean path still authorized
