# S: admin UX honesty expansion (mw-407)

## Problem
REVIEW-rd2.md lists Andy-only items including physical AT, but admin/UX honesty needs test coverage proving admin/dashboard pages document pre-launch/internal-only nature honestly without claiming live operational KPIs.

## Solution
Add `scripts/admin-ux-honesty-expansion.test.mjs` verifying admin/dashboard pages document pre-launch nature, noindex robots meta, no live operational KPI claims, trust/security recovery links present.

## Acceptance Criteria
- `npm test` green across all scripts
- `npm run lint` clean (0 errors)
- `npm run typecheck` clean
- `npm run build` green (103 pages)
- `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false
- No frozen paths touched
- Spec Kit artifacts present (this spec, plan, tasks, build-readiness)
