# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: O(n) scan under 20-char postcode strings.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: postcode control-char reject closes a surface that could be used for log-injection or test-result manipulation.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1231-postcode-control-chars; rollback by revert.

## 7. Operations
Status: ALREADY_COVERED
Reason: operators already validate postcodes at entry; no new operator steps.

## 8. Runtime hygiene
Status: APPLIES
Reason: postcode_normalise.py only; voice and deploy paths untouched.
