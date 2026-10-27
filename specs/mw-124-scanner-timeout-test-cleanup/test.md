# test.md — mw-124

## Verdict
verified

## Commands
- `npm test` → # tests 630 # pass 630 # fail 0
- Isolated bot-rejected browser fallback: 8/8 pass
- `npm run lint` → 0 errors (14 pre-existing warnings)

## Evidence
Before on clean main: 629/630; `assert.ok(browserUrls.length >= 2)` failed after ~6.1s; post-test `scanner_v2_job_not_found` unhandledRejection.
After: 630/630, no async leakage observed under full suite.
