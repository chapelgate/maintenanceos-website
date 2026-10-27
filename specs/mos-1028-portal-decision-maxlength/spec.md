# mos-1028-portal-decision-maxlength

## Goal
Expose CONTRACTOR_DECISION_MAX and CONTRACTOR_LINK_TOKEN_MAX on contractor portal hidden decision/token controls via maxlength.

## Acceptance
- decision confirm form decision/token inputs carry matching maxlength
- availability and complete forms token inputs carry CONTRACTOR_LINK_TOKEN_MAX
- tests/test_portal_decision_maxlength.py passes
- existing portal maxlength/a11y tests still pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
