# Plan: S13 Follow-up — Terms Page [COUNSEL] Placeholder Fix

## Overview
Replace the two remaining `[COUNSEL]` placeholders in `src/app/terms/page.tsx` with `[ANDY: ...]` placeholders.

## Steps
1. Replace `[COUNSEL]` in "Intellectual property" section with `[ANDY: IP ownership, marks, branding, and limited licence terms per counsel review.]`
2. Replace `[COUNSEL]` in "Changes to these terms" section with `[ANDY: how updates take effect and are communicated once a final version exists, per counsel review.]`
3. Run `npm run build` and verify no `[COUNSEL]` or `[OWNER]` in build output
4. Run `npm test` to verify no regressions
5. Create PR and merge to main

## Checklist
- [x] Replace [COUNSEL] in terms page Intellectual property section
- [x] Replace [COUNSEL] in terms page Changes to these terms section
- [x] Run npm run build - passes (96 pages)
- [x] Run npm test - all relevant tests pass
- [x] Verify no [COUNSEL] or [OWNER] in out/ build output
- [x] Create specs/S13-followup-terms-counsel/spec.md
- [x] Create specs/S13-followup-terms-counsel/plan.md