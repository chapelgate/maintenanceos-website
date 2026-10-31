# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: redaction locks only; no new public traffic paths.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no new queries or caches.

## 3. Data and consistency
Status: APPLIES
Reason: audit detail stored via operations uses redact_detail before persistence.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no new topics or workers.

## 5. Security
Status: APPLIES
Reason: locks secret scrubbing for audit detail, HTTP errors, and shared secret_patterns imports.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1065-audit-detail-redaction; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: operators rely on redacted audit detail without raw tokens in stored events.

## 8. Runtime hygiene
Status: APPLIES
Reason: consumers import secret_patterns; no duplicated BEARER_VALUE compiles.
