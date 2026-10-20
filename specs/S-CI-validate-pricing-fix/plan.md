# Plan: S-CI Validate Job Pricing Page Generation Fix

## Changes
1. **src/app/pricing/page.tsx**: Add `export const dynamic = "force-static"` to explicitly force static generation
2. **specs/S-CI-validate-pricing-fix/**: Create required artifact files for estate-gate

## Testing
- Local: npm ci, npm run build, npm test all pass (pricing test passes)
- CI: validate job passes, estate-gate passes, webkit-a11y passes

## Rollback
Revert the pricing page change if it causes regressions.