# mos-1027-dashboard-safety-clearance-max

## Goal
Bound dashboard Work Orders safety clearance evidence to SAFETY_CLEARANCE_REASON_MAX (1000) before clear_critical_safety, with an explicit Streamlit error instead of relying only on SafetyStateError.

## Acceptance
- Work Orders path checks clearance_reason against SAFETY_CLEARANCE_REASON_MAX
- overlong reason shows "Safety clearance evidence is too long" and does not call clear_critical_safety
- tests/test_dashboard_safety_clearance_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
