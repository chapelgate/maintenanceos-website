# mos-1028-dashboard-control-maxchars

## Goal
Dashboard AI control change reason input exposes AI_SIDE_EFFECT_REASON_MAX via max_chars.

## Acceptance
- control_reason text_input has max_chars=AI_SIDE_EFFECT_REASON_MAX
- existing length check remains
- tests/test_dashboard_control_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
