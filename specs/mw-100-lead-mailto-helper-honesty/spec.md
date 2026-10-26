# mw-100-lead-mailto-helper-honesty

## Goal
LeadCaptureForm helper copy must not present the mailto draft path as the only submit behaviour when a form endpoint may be configured.

## Acceptance
- `node --test scripts/lead-mailto-helper-honesty.test.mjs` passes.
- Helper states the mailto draft applies when no form endpoint is configured.
