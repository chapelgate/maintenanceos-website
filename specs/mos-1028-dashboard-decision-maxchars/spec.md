# mos-1028-dashboard-decision-maxchars

## Goal
Dashboard Decision reason input exposes APPROVAL_REASON_MAX via max_chars. APPROVAL/REJECT/TRIAGE reason maxima are equal (1000).

## Acceptance
- decision text_input has max_chars=APPROVAL_REASON_MAX
- APPROVAL_REASON_MAX == REJECT_REASON_MAX == TRIAGE_REASON_MAX == 1000
- existing length checks remain
- tests/test_dashboard_decision_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
