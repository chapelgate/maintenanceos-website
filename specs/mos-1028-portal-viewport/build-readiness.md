# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: HTML document head meta only; no ingress or rate-limit change.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one static meta tag string; no queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: presentation markup only; no persistence or schema change.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: contractor portal HTML only; no messaging paths changed.

## 5. Security
Status: ALREADY_COVERED
Reason: portal still fails closed on tokens and control chars; viewport does not loosen CSP.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-portal-viewport/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs.

## 8. Runtime hygiene
Status: APPLIES
Reason: viewport meta locked by source and rendered HTML assertions for portal pages.
