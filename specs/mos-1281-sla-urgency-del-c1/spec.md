# mos-1281-sla-urgency-del-c1

## Goal
sla.sla_status must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in urgency, in addition to all C0 controls.

## Acceptance
- sla_status raises on DEL and C1 in urgency
- Clean known urgency still returns OK
- Existing C0 reject suite remains green
