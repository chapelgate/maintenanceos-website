# S: a11y heading hierarchy test coverage expansion (mw-400)

## Problem
The heading hierarchy accessibility test only covers 4 key pages. It should cover all 28 exported pages to catch heading-skip regressions across the full site and strengthen the accessibility engineering score (REVIEW-rd2.md accessibility 8 → 9).

## Solution
Extend `scripts/a11y-heading-hierarchy.test.mjs` to run all checks (heading level skipping, h1 descriptive/single, h2→h3→h4 intermediate, no empty heading text) across 28 pages instead of 4. New pages added: about, buyers, contact, demo, features, industries, integrations, help, how-it-works, how-we-keep-control, security, status, trust, privacy, terms, subprocessors, cookies, vulnerability-disclosure, onboarding, dashboard, error, not-found.

## Acceptance Criteria
- `npm test` green: 867/867 pass
- `npm run lint` clean (0 errors, only pre-existing warnings)
- `npm run typecheck` clean
- `npm run build` green (103 pages)
- No frozen paths touched; `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false
- Spec Kit artifacts present (this spec, plan, tasks, build-readiness)
