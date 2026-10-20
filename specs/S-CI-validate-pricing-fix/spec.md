# S-CI: Validate Job Pricing Page Generation Fix

## Problem
The validate job in website-integration-repair-validation.yml passes the build-before-test order (fixed in S-CI PR #331), but the pricing page (`out/pricing/index.html`) is still not generated in the CI container during static export. The test `scripts/pricing-copy.test.mjs` fails with `ENOENT: no such file or directory, open 'out/pricing/index.html'`.

Locally the build generates the pricing page correctly. The issue only occurs in the CI Docker container (node:24-bookworm).

## Root Cause
Next.js 16.3.8 static export in the CI environment (Linux Docker container) does not generate the pricing page, despite it being a static page with no dynamic functions. The page uses `getPricingConfig()` which reads build-time environment variables, but this should not prevent static generation.

## Solution
Add `export const dynamic = "force-static"` to the pricing page (`src/app/pricing/page.tsx`) to explicitly force static generation. This ensures Next.js treats the page as static even in edge cases where automatic detection might fail.

## Acceptance Criteria
- validate job in website-integration-repair-validation.yml passes
- `out/pricing/index.html` is generated in CI container
- `scripts/pricing-copy.test.mjs` test passes
- All other validate job checks pass (page count, robots.txt, sitemap.xml, accessibility, lint, typecheck, browser smoke)