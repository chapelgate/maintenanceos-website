# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: clip overlong HTTP error details after redaction before JSON responses.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single length check and slice on error strings.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: response-only clip; no persistence or schema change.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging or worker changes in this slice.

## 5. Security
Status: APPLIES
Reason: redacted error details cannot grow without bound in client-visible responses.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-http-error-detail-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: exception handler keeps returning a bounded detail string.

## 8. Runtime hygiene
Status: APPLIES
Reason: overlong detail never leaves sanitize_http_detail intact.
