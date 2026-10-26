# mw-98-lead-form-error-summary

## Goal
LeadCaptureForm must present a form-level error summary when field validation fails, listing email and phone errors together.

## Acceptance
- `node --test scripts/lead-form-error-summary.test.mjs` passes.
- Summary is focusable, role=alert, and links to the invalid fields.
