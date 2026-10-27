# mos-1028-portal-get-id-bound

## Goal
Contractor portal GET handlers revalidate work_order_id and contractor_id through _positive_int before token/link checks.

## Acceptance
- contractor_decision, availability_form, and complete_form call _positive_int on both ids
- oversize ids raise HTTP 400
- tests/test_portal_get_id_bound.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
