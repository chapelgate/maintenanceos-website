# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: call capacity fail-closed on control-char lease identifiers.

## 2. Performance
Status: NOT_APPLICABLE
Reason: same O(n) scan under existing lock.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: APPLIES
Reason: lease rejection before registration protects call state.

## 5. Security
Status: APPLIES
Reason: control-char call_sid/worker_id fail closed.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1229-call-capacity-control-chars; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: operators get clean rejection on malformed call identifiers.

## 8. Runtime hygiene
Status: APPLIES
Reason: call_capacity.py only; voice/deploy paths untouched.
