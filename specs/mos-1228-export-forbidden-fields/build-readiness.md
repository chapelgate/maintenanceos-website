# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: frozenset membership only at export start.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: export allowlist fails closed if session/csrf/cookie/bearer keys are added later.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1228-export-forbidden-fields; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: CSV export stays free of auth-material field names.

## 8. Runtime hygiene
Status: APPLIES
Reason: export_csv.py only; voice and deploy paths untouched.
