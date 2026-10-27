# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed overlong audit detail before AuditEvent persistence.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single length check on already-redacted detail; no new queries.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration; rejects overlong detail instead of storing it.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging or worker changes in this slice.

## 5. Security
Status: APPLIES
Reason: overlong audit payloads rejected after redaction before write.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-audit-detail-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: ValueError keeps audit path fail-closed for overlong detail.

## 8. Runtime hygiene
Status: APPLIES
Reason: overlong detail never reaches session.add for AuditEvent.
