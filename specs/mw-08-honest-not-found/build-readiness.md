# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: One app-router not-found page and a source-reading test. Static export still uses the root layout.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data or storage behaviour changes.

## 3. Security and Privacy
Status: NOT_APPLICABLE
Reason: No form, credential, or privacy surface changes.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Unknown addresses now render an explicit page instead of the framework default.

## 5. Accessibility and UX
Status: APPLIES
Reason: The page has one h1 via PageHero and text links. It does not claim a WCAG audit.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by scripts/honest-not-found.test.mjs.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: The page states pre-launch and refuses price, phone, calendar, and chat claims.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Delete the new files to restore the framework default. No deploy change.
