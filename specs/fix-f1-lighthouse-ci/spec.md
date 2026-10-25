# F1: Add Lighthouse CI gate workflow for /, /pricing/, /create/, /contact/

## Problem
No Lighthouse CI gate exists for the public site key pages (/,
/pricing/, /create/, /contact/). Performance, accessibility, best-practices and
SEO category scores are not enforced in CI.

## Solution
Add `.github/workflows/lighthouse.yml` which builds the static export, serves
it on localhost:3000, runs Lighthouse headless Chrome (mobile preset) against
the four pages, reports the four category scores per page, and fails the job if
any category score is below 90.

## Acceptance Criteria
- `.github/workflows/lighthouse.yml` exists and runs on pull_request branches: [main]
- Lighthouse runs headless Chrome mobile against /, /pricing/, /create/, /contact/
- The four category scores per page are reported
- The job fails if any category score < 90
- Local `npm ci && npx tsc --noEmit && npm run lint && npm test && npm run build` pass
- `git diff --check origin/main HEAD` is clean

## Skills used
poteto-mode, verification-before-completion, no-comments
