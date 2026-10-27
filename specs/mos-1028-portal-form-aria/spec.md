# mos-1028-portal-form-aria

## Goal
Availability and complete contractor portal forms expose aria-labelledby matching their h1 headings, consistent with the decision confirm form.

## Acceptance
- availability form has id=availability-heading and aria-labelledby
- complete form has id=complete-heading and aria-labelledby
- decision confirm landmarks remain
- tests/test_portal_form_aria.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
