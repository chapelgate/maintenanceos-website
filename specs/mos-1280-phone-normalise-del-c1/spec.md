# mos-1280-phone-normalise-del-c1

## Goal
phone_normalise.normalise_phone must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to all C0 controls, matching api._reject_control_chars coverage for those ranges.

## Acceptance
- normalise_phone returns "" for DEL and C1 inputs
- is_e164_phone is False for DEL/C1 inputs
- Existing C0 reject + clean UK mobile accept remain green
