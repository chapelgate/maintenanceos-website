# mos-1027-phone-normalise-max

## Goal
Fail closed when phone normalisation exceeds Resident.phone String(50), without editing frozen identity.py.

## Acceptance
- phone_normalise.PHONE_MAX == 50
- overlong raw or normalised input returns ""
- channels.resident_by_phone returns None without SessionLocal for empty/overlong phones
- identity.py untouched

## Out of scope
identity.py, ush_identity, voice_bridge, deploy, live IdP, commercial runtime flags.
