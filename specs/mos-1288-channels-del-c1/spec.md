# mos-1288-channels-del-c1

## Goal
channels._has_control_chars and resident_by_email must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 rules.

## Acceptance
- canonical_incident_key / create_from_channel raise on DEL and C1
- resident_by_email returns None for DEL/C1 emails
- Existing C0 reject + clean paths remain green
