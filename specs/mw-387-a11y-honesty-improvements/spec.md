# mw-387: Accessibility honesty improvements — WCAG 2.2 AA automated coverage and claims discipline

## Problem
The accessibility page and test matrix are thorough but several non-Andy gaps remain:
1. Help articles `/help/accessibility-features.mdx` makes no testable claim — just "we are working toward WCAG 2.2 AA"
2. No automated test validates that accessibility page itself contains accurate scope descriptions
3. No test ensures axe coverage matrix in `/accessibility/` page matches actual `tests/webkit-a11y/a11y.test.mjs` routes
4. No assertion that `NEXT_PUBLIC_PUBLIC_LAUNCH=false` correlates with "not verified" language everywhere

## Solution
1. Update `/help/accessibility-features.mdx` to link to `/accessibility/` and use identical scope language
2. Add test `scripts/a11y-page-scope.test.mjs` that validates accessibility page claims match test matrix
3. Add test `scripts/a11y-help-claims.test.mjs` that validates help article a11y claims are honest (no WCAG AA claim while publicLaunch=false)
4. Keep all existing gate structure — no new CI requirements, no frozen path changes

## Acceptance Criteria
1. Help article references accessibility page with identical scope language
2. New test `a11y-page-scope.test.mjs` passes — accessibility page route list matches test matrix
3. New test `a11y-help-claims.test.mjs` passes — no WCAG AA claim in help when publicLaunch=false
4. All existing tests pass (630/630)
5. `npm run lint` clean, `npm run typecheck` clean, `npm run build` green
6. No frozen paths touched (deploy/**, live nginx, production DBs, golden line 165.227.227.9, IR deadlines, disclosure/redaction, EW portfolio, approved releases, live customers)
7. `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false