# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: static HTML markup only; no rate limits or retries changed.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one anchor and one id attribute; no new queries or assets.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: presentation markup only; no persistence or schema change.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: contractor portal HTML only; messaging unchanged.

## 5. Security
Status: ALREADY_COVERED
Reason: existing portal auth and CSP remain; skip link is same-document fragment only.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-portal-skip-link/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs.

## 8. Runtime hygiene
Status: APPLIES
Reason: skip-link presence locked by source and rendered HTML tests.
