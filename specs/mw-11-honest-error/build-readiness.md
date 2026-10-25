# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Two app-router error boundaries and a source-reading test.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data or storage behaviour changes.

## 3. Security and Privacy
Status: APPLIES
Reason: Exception text and digest are not rendered.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: The visitor can try the same page again.

## 5. Accessibility and UX
Status: APPLIES
Reason: Each screen has one h1 and a named button. No WCAG certification is claimed.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by scripts/honest-error.test.mjs.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: The screens refuse a sale, a price, and a live phone number.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Delete the new files to restore the framework screens. No deploy change.

Artifact directory: specs/mw-11-honest-error
