# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Global error recovery links and a source-reading test only.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data store or schema change.
## 3. Security and Privacy
Status: APPLIES
Reason: Keeps the honest pre-launch failure screen; no secret or stack exposure.
## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Adds recovery navigation when the root error boundary renders.
## 5. Accessibility and UX
Status: APPLIES
Reason: Keyboard-reachable recovery links on the failure screen.
## 6. Testing and Verification
Status: APPLIES
Reason: node --test locks the honesty wording and links.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Failure screen remains a synthetic pre-launch demo.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy, nginx, or launch-flag change.
Artifact directory: specs/mw-55-global-error-nav
