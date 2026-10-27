# mw-135-consolidated-evidence

## Goal
One SHA-bound consolidated evidence artifact that aggregates candidate, secret-scan, rollback, and health local evidence for the exact-candidate gate.

## Acceptance
- npm run consolidated:evidence writes consolidated-evidence.json for HEAD with ok=true.
- node --test scripts/consolidated-evidence.test.mjs passes.
- No deploy, nginx, or PUBLIC_LAUNCH change.
