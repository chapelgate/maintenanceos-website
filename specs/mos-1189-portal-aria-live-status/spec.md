# mos-1189-portal-aria-live-status
FEATURE: contractor portal outcome pages announce status to assistive tech

## What
Decision, availability, and completion outcome pages wrap the status message in role="status" aria-live="polite".

## Why
RELEASE_PLAN accessibility slices (mos-1042/1056/1062). Outcome pages used plain h1/p with no live region.

## Acceptance
- Decision / availability / completion success HTML includes role="status" and aria-live="polite"
- Portal shell main is not a live region
- Existing skip-link and form a11y suites stay green
- No frozen paths; no CSP inline-style changes; commercial_release_ready stays false
