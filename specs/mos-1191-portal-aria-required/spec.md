# mos-1191-portal-aria-required
FEATURE: mark required contractor portal fields with aria-required

## What
Availability start/end and completion note controls already use HTML required. Add aria-required="true" so assistive tech announces the required state consistently (WCAG 4.1.2 / 3.3.2).

## Why
RELEASE_PLAN accessibility slices (mos-1042/1056/1062). Required state is only native today; aria-required makes it explicit for AT.

## Acceptance
- availability start/end inputs include aria-required="true"
- completion note textarea includes aria-required="true"
- Existing portal a11y/skip/form suites stay green
- No frozen paths; CSP unchanged; commercial_release_ready stays false
