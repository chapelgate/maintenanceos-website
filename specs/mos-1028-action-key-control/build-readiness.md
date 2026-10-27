# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed control-char reject before SessionLocal opens on action keys.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early character scan; no new queries, caches, or indexes.

## 3. Data and consistency
Status: APPLIES
Reason: refuses invalid action_key/event_key before claim_action or writes.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing contractor/resident paths without new topics.

## 5. Security
Status: APPLIES
Reason: control-char reject on action_key/event_key reduces injection into receipts.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-action-key-control/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs beyond existing fail-closed returns.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid action/event keys never reach SessionLocal or ActionReceipt rows.
