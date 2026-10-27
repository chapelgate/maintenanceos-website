# mos-1027-postcode-normalise-max

## Goal
Bound postcode normalisation to Property.postcode String(20), without editing frozen identity.py.

## Acceptance
- postcode_normalise.POSTCODE_MAX == 20
- overlong raw/normalised returns ""
- api.identity_postcode uses bounded normalise_postcode; maximum=20
- identity.py untouched

## Out of scope
identity.py, ush_identity, deploy, live IdP, commercial runtime flags.
