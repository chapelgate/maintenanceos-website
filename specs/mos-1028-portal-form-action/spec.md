# mos-1028-portal-form-action

## Goal
Availability and complete contractor portal forms declare explicit action URLs matching their POST handlers, consistent with the decision confirm form.

## Acceptance
- availability form action="/contractor/availability"
- complete form action="/contractor/complete"
- decision form keeps action="/contractor/decision"
- tests/test_portal_form_action.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
