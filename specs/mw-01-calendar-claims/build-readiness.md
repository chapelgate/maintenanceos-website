# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Changes stay in integrations config and two UI pages; no new services, OAuth apps, backends, or package dependencies are introduced.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No database, cookies, or persisted user credentials are added; status is static config only.

## 3. Security and Privacy
Status: APPLIES
Reason: Removes Connect for unavailable providers and avoids implying browser-safe credential handling; no secrets or client ids are added.

## 4. Reliability and Fallbacks
Status: ALREADY_COVERED
Reason: Coming-soon cards already use notify-me unavailable state; provider page reuses the same unavailable path as Cal.com.

## 5. Accessibility and UX
Status: APPLIES
Reason: Coming-soon labelling remains visible card status; Connect is withheld so users are not offered a dead auth flow.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by integrations.test.ts provider status assertions and scripts/integrations-claims.test.mjs source honesty checks.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Stops labelling Google Calendar and Outlook as available and removes present-tense connect claims on the static pre-launch site.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Single draft branch with additive Spec Kit docs; rollback is revert of the honesty commits plus PR body header removal.
