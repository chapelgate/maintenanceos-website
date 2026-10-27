# mos-1028-portal-response-page

## Goal
Contractor portal POST success responses use _portal_page so lang=en-GB and main landmarks match GET forms.

## Acceptance
- decision/availability/complete submit success HTML includes lang=en-GB and <main>
- responses use h1 headings
- tests/test_portal_response_page.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
