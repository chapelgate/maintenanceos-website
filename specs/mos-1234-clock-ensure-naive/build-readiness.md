# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: pure datetime helper.

## 3. Data and consistency
Status: APPLIES
Reason: shared naive-UTC normalisation for schema-compatible timestamps.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: NOT_APPLICABLE
Reason: no secrets or auth changes; clock helper only.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1234-clock-ensure-naive; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: callers get clear ValueError on non-UTC aware inputs.

## 8. Runtime hygiene
Status: APPLIES
Reason: clock.py only; voice and deploy paths untouched.
