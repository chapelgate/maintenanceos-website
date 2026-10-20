# Specification: S13 Follow-up — Terms Page [COUNSEL] Placeholder Fix

## Objective
Replace the remaining two `[COUNSEL]` placeholders in `/terms/` page with `[ANDY: ...]` placeholders. The privacy and cookies pages were already completed in S13; only the terms page had two remaining `[COUNSEL]` placeholders (Intellectual property, Changes to these terms).

## Acceptance Criteria
- `/terms/` page returns HTTP 200
- No `[COUNSEL]` or `[OWNER]` strings remain in page source (build output)
- Only `[ANDY: ...]` placeholders remain across all three legal pages
- `npm run build` passes
- `npm test` passes (legal surfaces test)

## Sources
- MASTER_PLAN.md S13 — Legal: Complete Legal Pages (Except Andy's Facts)
- IMPL_STATE.md — S13 PARTIAL note: "src/app/terms/page.tsx still has 2 [COUNSEL] on main and live"
- impl\src\src\app\terms\page.tsx