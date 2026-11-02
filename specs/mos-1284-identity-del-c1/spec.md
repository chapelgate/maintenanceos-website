# mos-1284-identity-del-c1

## Goal
identity.normalise_phone and identity.normalise_postcode must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to all C0 controls.

## Acceptance
- normalise_phone returns "" for DEL and C1 inputs
- normalise_postcode returns "" for DEL and C1 inputs
- Existing C0 reject + clean UK mobile/postcode accept remain green
