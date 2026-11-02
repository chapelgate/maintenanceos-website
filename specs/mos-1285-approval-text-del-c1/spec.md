# mos-1285-approval-text-del-c1

## Goal
approval_text._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F), while keeping tab/newline/CR allowed.

## Acceptance
- bounded_proposed_action and bounded_approval_reason raise on DEL and C1
- Clean text and multiline with tab/newline still accepted
- Existing C0 reject suite remains green
