# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed event_key length guard on confirm_appointment before session open.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early length check; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation only.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing claim_action receipt path without new topics or workers.

## 5. Security
Status: APPLIES
Reason: rejects overlong event keys before tenant reads; covered by test_appointment_event_key_max.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-appointment-event-key-max/; ready PR; rollback by reverting the slice commit and deleting the new test and specs folder.

## 7. Operations
Status: APPLIES
Reason: False return on invalid event_key keeps confirmation fail-closed without new alerts.

## 8. Runtime hygiene
Status: APPLIES
Reason: overlong event keys never open SessionLocal or write ActionReceipt rows.
