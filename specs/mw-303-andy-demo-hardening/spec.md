# Spec: Andy Demo Script Synthetic Disclosure Hardening

## Objective
Hardening the Andy synthetic demo script and error boundaries to remove WCAG 2.2 AA verified claims, add explicit synthetic markers, and ensure error boundaries don't leak digests.

## Acceptance Criteria
- docs/demo/ANDY_SYNTHETIC_DEMO.md: line 14 "WCAG 2.2 AA is verified" removed/replaced with "WCAG 2.2 AA is NOT verified"
- Error boundary comments updated with no-digest-leak notes
- No console.log/error in error.tsx or global-error.tsx
- Release preflight gate validates error pages don't leak internal diagnostics
- Tests pass 630/0
