# mos-1028-dashboard-lifecycle-maxchars

## Goal
Dashboard lifecycle reason input exposes REOPEN_REASON_MAX via max_chars. REOPEN/CANCEL/NO_SHOW maxima are equal (1000), so one UI cap matches all three fail-closed checks.

## Acceptance
- lifecycle text_input has max_chars=REOPEN_REASON_MAX
- REOPEN_REASON_MAX == CANCEL_REASON_MAX == NO_SHOW_REASON_MAX == 1000
- existing length checks remain
- tests/test_dashboard_lifecycle_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
