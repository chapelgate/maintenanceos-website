# mos-1297-identity-contract-del-c1

## Goal
identity_contract._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- authorize_identity rejects DEL and C1 in issuer/subject/session_id
- Existing C0 reject suite remains green
