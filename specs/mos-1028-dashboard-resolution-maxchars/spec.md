# mos-1028-dashboard-resolution-maxchars

## Goal
Dashboard escalation Resolution reason input exposes ESCALATION_RESOLUTION_MAX via max_chars.

## Acceptance
- Resolution text_input has max_chars=ESCALATION_RESOLUTION_MAX
- existing length check remains
- tests/test_dashboard_resolution_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
