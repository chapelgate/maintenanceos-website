# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: observes existing lockout; does not change attempt thresholds.

## 2. Performance
Status: APPLIES
Reason: one structured log line only when lockout first engages.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no data model or persistence changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: never logs email or hashed key; outcome/reason_code only.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1206-login-lockout-event; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: operators can see lockout pressure when structured logging is enabled.

## 8. Runtime hygiene
Status: APPLIES
Reason: reuses operational_event; voice and deploy paths untouched.
