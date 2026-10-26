# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Accessibility landmark lock across app layouts.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data store or schema change.
## 3. Security and Privacy
Status: NOT_APPLICABLE
Reason: No auth, secrets, or network change.
## 4. Reliability and Fallbacks
Status: NOT_APPLICABLE
Reason: Test-only extension of an existing lock.
## 5. Accessibility and UX
Status: APPLIES
Reason: Protects skip link and main landmark presence.
## 6. Testing and Verification
Status: APPLIES
Reason: node --test walks every layout.tsx.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Still forbids WCAG 2.2 AA verified wording.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy, nginx, or launch-flag change.
Artifact directory: specs/mw-58-skip-link-all-layouts
