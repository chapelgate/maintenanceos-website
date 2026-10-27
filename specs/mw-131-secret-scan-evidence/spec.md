# mw-131-secret-scan-evidence

## Goal
Add a local SHA-bound secret-scan policy evidence artifact that proves the repo keeps the pattern scan in npm test without hiding findings via .gitleaksignore.

## Acceptance
- npm run secret-scan:evidence writes secret-scan-evidence.json for HEAD.
- node --test scripts/secret-scan-evidence.test.mjs passes.
- Evidence sets executedScan false and forbids .gitleaksignore hide.
