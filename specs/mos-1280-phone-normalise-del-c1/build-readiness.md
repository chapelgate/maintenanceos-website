# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress routing or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single-pass character check; no hot-path algorithm change.

## 3. Data and consistency
Status: APPLIES
Reason: phone normalisation boundary rejects DEL/C1 before digit filtering.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async path edits.

## 5. Security
Status: APPLIES
Reason: aligns phone_normalise control reject with api._reject_control_chars for DEL and C1.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1280-phone-normalise-del-c1; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: named acceptance tests prove DEL/C1 reject and clean mobile accept.

## 8. Runtime hygiene
Status: APPLIES
Reason: phone_normalise.py only; frozen paths untouched.
