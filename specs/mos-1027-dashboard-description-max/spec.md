# mos-1027-dashboard-description-max

## Goal
Bound New Work Order Problem text on the dashboard to WORK_ORDER_DESCRIPTION_MAX (8000) and reject control characters before WorkOrder.create, matching the API create_work_order fail-closed path.

## Acceptance
- dashboard New Work Order path refuses descriptions longer than WORK_ORDER_DESCRIPTION_MAX
- dashboard New Work Order path refuses control characters in description
- overlong/control-char input shows an error and does not commit a WorkOrder
- tests/test_dashboard_description_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
