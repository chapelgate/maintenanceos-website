# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Bounded ChatWidget keyboard behaviour only.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No new data store.
## 3. Security and Privacy
Status: ALREADY_COVERED
Reason: Mailto-only; no /api/chat.
## 4. Reliability and Fallbacks
Status: ALREADY_COVERED
Reason: Static not-connected panel unchanged.
## 5. Accessibility and UX
Status: APPLIES
Reason: Escape close + focus return; no WCAG AA claim.
## 6. Testing and Verification
Status: APPLIES
Reason: scripts/chat-widget-escape.test.mjs locks.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Keep not-connected / mailto honesty.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy or launch-flag change.
