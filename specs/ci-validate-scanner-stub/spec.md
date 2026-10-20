# CI Validate Workflow Scanner Stub Fix

## Problem
The `validate` job in `.github/workflows/website-integration-repair-validation.yml` times out on the browser test `create-mobile-stability-browser.mjs` because:
1. The build sets `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/scan`
2. But `src/config/site.ts` hardcoded `onboardingScanEndpoint: "/api/website/scan"` and didn't read the env var
3. The browser test mocks `/api/website/scan` on its test server, but the inlined config used the hardcoded value
4. The test server couldn't handle requests to `http://127.0.0.1:8788/scan` (no scanner stub running)

## Solution
Make `onboardingScanEndpoint` configurable via `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` at build time, with fallback to `/api/website/scan`. Update the validate workflow to not set the env var at build time, so the default same-origin endpoint is used (which the browser test mocks).

## Changes
1. `src/config/site.ts`: Read `onboardingScanEndpoint` from `process.env.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` with fallback
2. `.github/workflows/website-integration-repair-validation.yml`: Remove `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` from build command
3. Update tests that check the site.ts pattern