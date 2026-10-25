# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Changes the health-monitor default only; adds no replacement control-plane backend or deploy path.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: Monitor remains a read-only checker; no datastore writes are introduced.

## 3. Security and Privacy
Status: APPLIES
Reason: Stops calling a retired third-party host by default; site.ts still names and rejects that host on the lead path.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Sitemap/page/link/asset checks always run; control-plane checks become opt-in via explicit env.

## 5. Accessibility and UX
Status: NOT_APPLICABLE
Reason: No user-facing website UI changes in this monitor slice.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by measurement.test.mjs assertions that the Railway host string is absent and checks are env-gated.

## 7. Brand and Claims Honesty
Status: NOT_APPLICABLE
Reason: Operational monitor behaviour only; no marketing claims changed.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Draft PR revert restores prior default; docs note the opt-in control-plane behaviour.
