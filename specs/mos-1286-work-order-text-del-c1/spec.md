# mos-1286-work-order-text-del-c1

## Goal
work_order_text.problem_description_error must reject DEL (U+007F) and C1 controls (U+0080–U+009F), while keeping tab/newline/CR allowed.

## Acceptance
- problem_description_error returns control-char error for DEL and C1
- Clean and multiline descriptions still accepted
- Existing C0 reject behaviour remains
