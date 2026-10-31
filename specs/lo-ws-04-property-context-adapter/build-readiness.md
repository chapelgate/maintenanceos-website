# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: acceptance locks only; no new public traffic paths added.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no new queries, caches, or indexes introduced.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration change in this slice.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no new topics, workers, or async patterns introduced.

## 5. Security
Status: APPLIES
Reason: Property context adapter maps synthetic rows; rejects non-England; no migration.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/lo-ws-04-property-context-adapter; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: named acceptance tests improve release-check honesty for operators.

## 8. Runtime hygiene
Status: APPLIES
Reason: reuses existing modules; voice and deploy paths untouched.
