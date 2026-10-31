# Spec: mw-297-eslint-clean

## Goal
ESLint-clean build with zero warnings across all product code.

## Acceptance
- `npm run lint --max-warnings=0` passes (0 errors, 0 warnings)
- `tsc --noEmit` clean
- `npm test` 630/630 pass
- `npm run build` succeeds
- No dead code introduced
