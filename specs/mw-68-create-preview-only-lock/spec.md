# mw-68-create-preview-only-lock

## Problem
Create funnel labelled "Live demo number available" and "call 24/7", which oversells a preview line as production always-on answering.

## Acceptance
- Demo number is labelled "Preview demo number (not production)".
- Demo blurb does not say call/answers 24/7; keeps not-production and not always-on.
- Funnel heading says preview funnel; honest limits remain.
- `node --test scripts/create-preview-only-lock.test.mjs` exits 0.
