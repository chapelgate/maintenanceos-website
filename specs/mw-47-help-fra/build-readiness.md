# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Help article copy and a source-reading test only.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data store or schema change.

## 3. Security and Privacy
Status: APPLIES
Reason: Removes unpublished FRA and golden-thread workflow claims.

## 4. Reliability and Fallbacks
Status: NOT_APPLICABLE
Reason: No runtime path changes.

## 5. Accessibility and UX
Status: NOT_APPLICABLE
Reason: Markdown help copy only. No layout change.

## 6. Testing and Verification
Status: APPLIES
Reason: node --test scripts/help-fra.test.mjs locks the honesty wording.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: The page no longer presents FRA compliance as available.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy, nginx, or launch-flag change.

Artifact directory: specs/mw-47-help-fra
