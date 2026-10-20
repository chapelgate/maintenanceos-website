# S26: Accessibility Remediation - Plan

## Approach
1. Update globals.css to match BRAND_SYSTEM.md light theme (paper #F8FAFC, blue accent #1D4ED8)
2. Verify skip link implementation in SkipLink.tsx and layout.tsx
3. Verify aria-live=polite on voice transcript in SandboxTestCallPanel
4. Audit form labels in CreateReceptionistForm.tsx and CreateReceptionistLaterSteps.tsx
5. Update tests to match new brand system values
6. Run build, TypeScript, lint, and tests

## Files Modified
- src/app/globals.css - Complete rewrite to light theme per BRAND_SYSTEM.md
- scripts/siri-orb-visual.test.mjs - Update expected CSS values
- scripts/site-accessibility.test.mjs - Update expected CSS values
- scripts/marketing-craft.test.mjs - Update expected CSS values
- scripts/product-tour.test.mjs - Update expected CSS values
- scripts/create-a11y.test.mjs - Update expected CSS values