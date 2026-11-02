# mos-1295-action-evidence-del-c1

## Goal
action_evidence._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 rules, preserving tab/newline/CR where allowed for detail.

## Acceptance
- record_action_result raises on DEL and C1 in action_key/actor/provider_reference/detail
- Existing C0 reject + clean paths remain green
