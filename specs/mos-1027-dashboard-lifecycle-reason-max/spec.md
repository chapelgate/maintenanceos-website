# mos-1027-dashboard-lifecycle-reason-max

## Goal
Bound dashboard Work Order lifecycle reasons and Approvals decision reasons to the existing operations maxima (1000) before mutate calls, with an explicit Streamlit error instead of a generic blocked message.

## Acceptance
- reopen/cancel/no-show paths refuse reasons longer than REOPEN/CANCEL/NO_SHOW_REASON_MAX
- reject/triage/approve paths refuse decision reasons longer than REJECT/TRIAGE/APPROVAL_REASON_MAX
- tests/test_dashboard_lifecycle_reason_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
