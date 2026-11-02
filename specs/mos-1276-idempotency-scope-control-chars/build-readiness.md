# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no hot-path algorithm or latency change.

## 3. Data and consistency
Status: APPLIES
Reason: ActionReceipt claim boundary rejects control characters in scope before write.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: closes C0 injection into idempotency scope keys at claim_action boundary.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1276-idempotency-scope-control-chars; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: named acceptance tests prove reject and clean claim paths.

## 8. Runtime hygiene
Status: APPLIES
Reason: idempotency.py claim_action plus named tests only; frozen paths untouched.
