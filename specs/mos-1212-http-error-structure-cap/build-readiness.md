# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: bounds error response body size for structured details.

## 2. Performance
Status: APPLIES
Reason: one json.dumps of already-sanitized structure on error path only.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: prevents oversized error payloads that could amplify secret leakage surface.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1212-http-error-structure-cap; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: error responses stay bounded for clients and logs.

## 8. Runtime hygiene
Status: APPLIES
Reason: http_error_text.py only; voice and deploy paths untouched.
