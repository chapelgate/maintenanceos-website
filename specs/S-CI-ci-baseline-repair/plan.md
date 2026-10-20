# Plan: S-CI CI Baseline Repair

## Changes
1. **website-integration-repair-validation.yml**: Move `npm run build` before `npm test` so static output exists when tests run
2. **specs/S-CI-ci-baseline-repair/**: Create required artifact files for estate-gate

## Testing
- Local: npm ci, npm run build, npm test all pass
- CI: validate job passes, estate-gate passes, webkit-a11y passes

## Rollback
Revert the workflow change if it causes regressions.