# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: error detail sanitisation only; no rate limits or retries changed.

## 2. Performance
Status: NOT_APPLICABLE
Reason: two extra regex substitutions on error paths only.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: response text only; no persistence or schema change.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: HTTPException handler path only; messaging unchanged.

## 5. Security
Status: APPLIES
Reason: redacts AWS access key IDs and JWTs from client-visible error details.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-http-error-aws-jwt-redact/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: ALREADY_COVERED
Reason: reuses existing HTTPException sanitising handler without new sinks.

## 8. Runtime hygiene
Status: APPLIES
Reason: AWS/JWT redaction locked by dedicated unit and handler tests.
