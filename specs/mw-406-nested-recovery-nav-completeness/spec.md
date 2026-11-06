# S: nested recovery nav completeness expansion (mw-406)

## Problem
REVIEW-rd2.md scores Page IA / conversion funnel at 9 with nested recovery nav complete. mw-365/366/367 (#645) landed nested recovery nav, but no test verifies all 28 exported pages plus error/not-found pages include recovery links to Help/Trust/Security/Contact with honest pre-launch disclaimers.

## Solution
Add `scripts/nested-blog-help-recovery-nav.test.mjs`, `scripts/nested-compare-integrations-recovery-nav.test.mjs`, `scripts/nested-industry-recovery-nav.test.mjs` verifying recovery nav links and honest pre-launch disclaimers across all slug/exported pages.

## Acceptance Criteria
- `npm test` green across all scripts
- `npm run lint` clean (0 errors)
- `npm run typecheck` clean
- `npm run build` green (103 pages)
- `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false
- No frozen paths touched
- Spec Kit artifacts present (this spec, plan, tasks, build-readiness)
