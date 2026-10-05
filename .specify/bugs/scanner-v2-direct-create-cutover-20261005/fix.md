# Fix

1. Restore the existing build-time `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` read in `src/config/site.ts`; empty remains fail-closed.
2. Keep endpoint ownership in DigitalOcean App Platform rather than committing a droplet hostname into source.
3. Point the already-existing public build variable at the approved Scanner V2 HTTPS endpoint before enabling the source hook.
4. Update only the tests that intentionally locked the superseded same-origin Functions design.
5. Correct one pre-existing stale assertion in `function-wrapper.test.ts`: the accepted Functions entrypoint is `bundle.cjs`, not `main`.
6. Leave the retired paid `onboarding-scan` service retired and leave all MaintenanceOS telephony/voice configuration untouched.

Rollback: revert this PR. The source then ignores the build variable and returns to the pre-existing same-origin route. Scanner V2 itself remains independently healthy and `bd34a89` remains its container rollback point.
