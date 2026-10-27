# mw-124-scanner-timeout-test-cleanup

## Goal
Close REVIEW-rd2 left-to-release item 3: clean-checkout npm test must be green.

## Bug
Under full-suite contention, `worker retries a bot-rejected homepage through the browser fetch` returned before the 401/403 browser recovery completed when `requestMs` was 8_000 (below the production default of 18_000). The assertion `browserUrls.length >= 2` failed and background work hit removed test state (`scanner_v2_job_not_found`).

## Acceptance
- Bot-rejected browser fallback test uses a request budget at or above the production default (18_000 ms).
- Full `npm test` on clean checkout: 630 pass / 0 fail.
- No production runtime, deploy, or frozen-path change.
