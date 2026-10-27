# mos-1028-dashboard-clearance-maxchars

## Goal
Dashboard safety clearance evidence text_area exposes SAFETY_CLEARANCE_REASON_MAX via max_chars.

## Acceptance
- text_area has max_chars=SAFETY_CLEARANCE_REASON_MAX
- existing length check remains
- tests/test_dashboard_clearance_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
