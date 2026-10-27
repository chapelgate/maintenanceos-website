# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed control-char and max-length reject before pilot proof token compare.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early character scan; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: header validation only; no persistence path changed.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing pilot synthetic email proof path without new topics.

## 5. Security
Status: APPLIES
Reason: control-char reject on X-Pilot-Proof-Token reduces malformed header abuse.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-pilot-proof-token-control/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs beyond existing HTTP 400.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid proof tokens never reach hmac.compare_digest.
