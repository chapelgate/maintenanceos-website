# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Demo script and lock tests only; no product runtime change beyond docs/scripts.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No new data store.
## 3. Security and Privacy
Status: APPLIES
Reason: Script forbids golden line, live customers, and PUBLIC_LAUNCH.
## 4. Reliability and Fallbacks
Status: NOT_APPLICABLE
Reason: Read-only demo checklist.
## 5. Accessibility and UX
Status: APPLIES
Reason: Script points at accessibility honesty; no WCAG AA claim.
## 6. Testing and Verification
Status: APPLIES
Reason: scripts/andy-demo-script.test.mjs locks.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Buyers/security/accessibility denials remain explicit.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy or launch-flag change.
