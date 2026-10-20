# Plan: Legal Pages Finalization (S13)

## Overview
Replace all `[COUNSEL]` and `[OWNER]` placeholders in legal pages with `[ANDY: ...]` placeholders. Finalize `/privacy/`, `/cookies/`, and `/terms/` pages.

## Steps
1. Replace `[COUNSEL]` and `[OWNER]` with `[ANDY: ...]` in `src/app/privacy/page.tsx`
2. Replace `[COUNSEL]` and `[OWNER]` with `[ANDY: ...]` in `src/app/cookies/page.tsx`
3. Replace `[COUNSEL]` and `[OWNER]` with `[ANDY: ...]` in `src/app/terms/page.tsx`
4. Replace `[OWNER]` with `[ANDY: ...]` in `src/components/LegalPageChrome.tsx`
5. Update `scripts/launch-gates.test.mjs` to check for `[ANDY:` instead of `[OWNER`/`[COUNSEL]`
6. Run `npm run build` and `npm test` to verify
7. Create PR and merge to main

## Checklist
- [x] Replace [COUNSEL]/[OWNER] in privacy page
- [x] Replace [COUNSEL]/[OWNER] in cookies page
- [x] Replace [COUNSEL]/[OWNER] in terms page
- [x] Replace [OWNER] in LegalPageChrome component
- [x] Update launch-gates test assertions
- [x] Create specs/s13-finalize-legal-pages/spec.md
- [x] Create specs/s13-finalize-legal-pages/plan.md
- [x] Run npm test - all relevant tests pass