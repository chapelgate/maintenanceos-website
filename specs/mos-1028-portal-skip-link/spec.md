# mos-1028-portal-skip-link

## Goal
Add a Skip to content link targeting main#main-content on every contractor portal page for WCAG 2.4.1 keyboard access.

## Acceptance
- _portal_page emits Skip to content href=#main-content and main id=main-content
- decision page HTML includes both
- tests/test_portal_skip_link.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags, Streamlit dashboard.
