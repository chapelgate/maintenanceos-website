# mos-1027-dashboard-escalation-resolution-max

## Goal
Bound dashboard Escalations resolution reason to ESCALATION_RESOLUTION_MAX (1000) before resolve_escalation, with an explicit Streamlit error instead of a generic blocked message.

## Acceptance
- Escalations path checks resolution against ESCALATION_RESOLUTION_MAX
- overlong reason shows "Resolution reason is too long" and does not call resolve_escalation
- tests/test_dashboard_escalation_resolution_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
