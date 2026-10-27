# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Bounded change for mw-153-chatwidget-static only.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No new data store or persistence path.
## 3. Security and Privacy
Status: NOT_APPLICABLE
Reason: Removes dead client form state; mailto unchanged.
## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Static site keeps explicit not-connected chat panel.
## 5. Accessibility and UX
Status: APPLIES
Reason: Keeps open/close controls and focus-visible styles without a fake form.
## 6. Testing and Verification
Status: APPLIES
Reason: node --test lock accompanies this change.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Widget cannot imply live chat delivery on the static export.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy, nginx, or launch-flag change.
