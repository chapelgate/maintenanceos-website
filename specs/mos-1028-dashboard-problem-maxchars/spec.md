# mos-1028-dashboard-problem-maxchars

## Goal
Dashboard Problem text_area exposes WORK_ORDER_DESCRIPTION_MAX via max_chars so UI matches fail-closed problem_description_error bounds.

## Acceptance
- Problem text_area has max_chars=WORK_ORDER_DESCRIPTION_MAX
- WORK_ORDER_DESCRIPTION_MAX imported from work_order_text
- tests/test_dashboard_problem_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
