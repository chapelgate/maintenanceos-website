# mos-1292-tenant-security-del-c1

## Goal
tenant_security._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- resident_by_phone_for_client returns None for DEL and C1 phones
- Existing C0 reject + clean accept remain green
