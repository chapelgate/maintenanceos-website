# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed recipient length guard on existing outbound queue path before mutation.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early length or readiness check; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation and readiness only.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing queues and paths without new topics or workers.

## 5. Security
Status: APPLIES
Reason: rejects overlong recipients before hashing or persistence; covered by test_recipient_max.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-recipient-max/; ready PR; rollback by reverting the slice commit and deleting the new test and specs folder.

## 7. Operations
Status: APPLIES
Reason: typed ValueError on invalid outbound recipient keeps queue fail-closed without new alerts.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid recipients raise before Communication or delivery rows are created.
