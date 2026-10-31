# Spec: Andy Demo Synthetic Disclosure Hardening

## Objective
Keep Andy's synthetic demo pack and error boundaries honest: no WCAG-verified claim, no digest leak, typecheck in release preflight.

## Acceptance Criteria
- docs/demo/ANDY_SYNTHETIC_DEMO.md does not claim WCAG 2.2 AA verified
- scripts/andy-demo-script.test.mjs locks the disclosure
- src/app/error.tsx and global-error.tsx void error without exposing digest/message
- scripts/release-preflight.mjs runs typecheck
- scripts/release-control.test.mjs locks typecheck gate

## Behavior Change
Demo docs and error boundaries stay fail-closed on unverified a11y and digests; release preflight includes typecheck.
