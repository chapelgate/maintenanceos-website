# S-CI: CI Baseline Repair

## Problem
Pre-existing CI failures on main block all WEBSITE_REPO slices:
1. **validate**: Test expecting `out/pricing/index.html` fails because `npm test` runs before `npm run build` in website-integration-repair-validation.yml
2. **webkit-a11y**: Static-site serving used by a11y run causes "Enter on elements navigating to another page" (pre-existing test infrastructure issue)
3. **performance-budget**: Codebase exceeds S19 budgets (~171-181KB JS gzip vs 150KB target) - not fixable in-repo without major changes
4. **security-live**: Live site missing Cloudflare security headers (Andy item A1) - not fixable in-repo

## Solution
Fix the validate job by reordering build before tests in website-integration-repair-validation.yml. This allows tests that read static output (e.g. scripts/pricing-copy.test.mjs reading out/pricing/index.html) to pass.

The webkit-a11y, performance-budget, and security-live failures are pre-existing issues outside the diff scope per TASK_IMPL.md rules.

## Acceptance Criteria
- validate job in website-integration-repair-validation.yml passes
- webkit-a11y passes (pre-existing pass on main)
- estate-gate passes with valid artifact