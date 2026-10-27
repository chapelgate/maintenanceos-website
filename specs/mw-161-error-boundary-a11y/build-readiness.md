# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Bounded client error-boundary a11y behaviour only.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No new data store.
## 3. Security and Privacy
Status: APPLIES
Reason: Keep void error; never render message/digest/stack.
## 4. Reliability and Fallbacks
Status: ALREADY_COVERED
Reason: Existing reset + home/contact recovery links.
## 5. Accessibility and UX
Status: APPLIES
Reason: role=alert + heading focus on mount; no WCAG AA claim.
## 6. Testing and Verification
Status: APPLIES
Reason: scripts/honest-error.test.mjs locks.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Keep pre-launch commerce and live-phone denials.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy or launch-flag change.
