# mos-1289-communications-del-c1

## Goal
communications._has_control_chars (both instances) must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 rules, preserving tab/newline/CR where allowed.

## Acceptance
- queue_outbound rejects DEL and C1 in recipient, action_key, body
- record_delivery_status rejects DEL and C1 in provider_reference, failure_code
- Existing C0 reject + clean paths remain green
