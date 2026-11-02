# mos-1282-postcode-normalise-del-c1

## Goal
postcode_normalise._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to all C0 controls.

## Acceptance
- normalise_postcode returns "" for DEL and C1 inputs
- postcode_matches is False for DEL/C1 inputs
- Existing C0 reject + clean accept remain green
