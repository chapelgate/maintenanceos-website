# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: One existing CI workflow moves from a hosted runner to the repo's estate runner. No new service.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data or storage behaviour changes.

## 3. Security and Privacy
Status: APPLIES
Reason: Actions are SHA-pinned, the token is read plus artifact upload, and fork pull requests do not use the self-hosted runner.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: The job has a 25 minute timeout. A failed check still blocks a merge.

## 5. Accessibility and UX
Status: APPLIES
Reason: The same WebKit accessibility tests run. This does not claim WCAG 2.2 AA.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by scripts/webkit-runner.test.mjs. The workflow run is the live check.

## 7. Brand and Claims Honesty
Status: NOT_APPLICABLE
Reason: No public copy changes.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert the workflow file to restore ubuntu-latest. No deploy change.

Artifact directory: specs/mw-14-webkit-estate-runner
