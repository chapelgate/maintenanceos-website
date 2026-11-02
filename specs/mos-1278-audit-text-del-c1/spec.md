# mos-1278-audit-text-del-c1

## Goal
audit_text.redact_detail must reject DEL (U+007F) and C1 controls (U+0080–U+009F), matching api._reject_control_chars, while still allowing tab/newline/CR and secret redaction.

## Acceptance
- redact_detail raises on DEL and C1
- redact_detail still redacts secrets on clean input
- Existing C0 reject + newline allow remain green
