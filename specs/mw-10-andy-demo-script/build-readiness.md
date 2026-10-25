# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: A markdown walkthrough and a source-reading test. No runtime change.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data or storage behaviour changes.

## 3. Security and Privacy
Status: APPLIES
Reason: The script forbids live customer records and the golden phone line.

## 4. Reliability and Fallbacks
Status: NOT_APPLICABLE
Reason: No runtime fallback changes.

## 5. Accessibility and UX
Status: APPLIES
Reason: The script records that a physical assistive-technology pass is not signed off and does not claim WCAG 2.2 AA.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by scripts/andy-demo-script.test.mjs.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: The script refuses prices, public launch, live phone, and a releasable-site claim.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Delete the doc and test. No deploy change.

Artifact directory: specs/mw-10-andy-demo-script
