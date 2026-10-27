# mos-1027-postcode-normalise-max

## Goal
Fail closed when postcode normalisation exceeds Property.postcode String(20), without editing frozen identity.py.

## Acceptance
- postcode_normalise.POSTCODE_MAX == 20
- overlong raw or normalised input returns ""
- postcode_matches is false for overlong or blank sides
- api identity_postcode uses postcode_normalise
- identity.py and voice_bridge.py untouched

## Out of scope
identity.py, voice_bridge, ush_identity, deploy, live IdP, commercial runtime flags.
