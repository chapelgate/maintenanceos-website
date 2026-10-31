# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Error boundary hardening + demo disclosure honesty; bounded client + doc change.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data store change.

## 3. Security and Privacy
Status: APPLIES
Reason: Error boundaries void error digest/message; no internal leak to users.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Error boundary fail-closed on unverified a11y and digests.

## 5. Accessibility and UX
Status: NOT_APPLICABLE
Reason: No visitor UI change; demo doc and error boundaries only.

## 6. Testing and Verification
Status: APPLIES
Reason: andy-demo-script.test.mjs locks disclosure; typecheck in release-preflight; 630/630 pass.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Demo docs no longer claim WCAG-verified; error boundaries honest.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert error.tsx, global-error.tsx, demo MDX, test, preflight locks; no deploy/flag change.

Artifact directory: specs/mw-303-andy-demo-hardening
