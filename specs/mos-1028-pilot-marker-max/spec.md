# mos-1028-pilot-marker-max

## Goal
Pilot synthetic email proof marker fail-closes using named PILOT_MARKER_MAX instead of a hardcoded 64.

## Acceptance
- PILOT_MARKER_MAX == 64
- pilot_synthetic_email_proof uses PILOT_MARKER_MAX
- overlong marker rejected by _bounded_text
- tests/test_pilot_marker_max.py passes

## Out of scope
voice golden line, deploy, secrets, frozen paths, commercial runtime flags.
