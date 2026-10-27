# mos-1028-portal-id-maxlength

## Goal
Contractor portal hidden work_order_id and contractor_id inputs expose maxlength=POSITIVE_INT_DIGITS matching POSITIVE_INT_MAX digit length.

## Acceptance
- POSITIVE_INT_DIGITS == len(str(POSITIVE_INT_MAX)) == 10
- decision, availability, and complete forms include maxlength on both hidden id fields
- tests/test_portal_id_maxlength.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
