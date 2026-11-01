# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: O(1) dict membership check.

## 3. Data and consistency
Status: APPLIES
Reason: unknown urgency no longer silently maps to P3 target.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: NOT_APPLICABLE
Reason: no secrets or auth changes; SLA classification only.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1220-sla-known-urgency; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: operators see explicit failure instead of silent P3 fallback.

## 8. Runtime hygiene
Status: APPLIES
Reason: sla.py only; voice and deploy paths untouched.
