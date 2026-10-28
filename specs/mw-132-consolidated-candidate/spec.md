# mw-132-consolidated-candidate

## Goal
Consolidate exact-candidate evidence across npm test, lint, typecheck, secret-scan, release marker, candidate-evidence, health-artifact and rollback-evidence into one SHA-bound artifact group.

## Acceptance
- scripts/consolidated-evidence.test.mjs passes.
- Secret-scan, release.json honesty, and all four evidence scripts bind to HEAD.
- No .gitleaksignore hide; no deploy/nginx/launch flags.
