# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: rejects malformed email lookups before DB query.

## 2. Performance
Status: APPLIES
Reason: cheap regex/control checks avoid needless resident queries.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: control characters and malformed emails fail closed before lookup.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1214-resident-email-format; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: channel intake stays on well-formed email keys only.

## 8. Runtime hygiene
Status: APPLIES
Reason: channels.py only; voice and deploy paths untouched.
