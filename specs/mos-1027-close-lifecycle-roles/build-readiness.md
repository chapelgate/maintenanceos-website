# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: close_work_order refuses non-lifecycle roles before closing a work order.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early checks; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; authorisation only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging or worker changes in this slice.

## 5. Security
Status: APPLIES
Reason: only admin/manager lifecycle roles may close; other same-client users fail closed.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-close-lifecycle-roles/; ready PR; rollback by reverting slice commit.

## 7. Operations
Status: APPLIES
Reason: unauthorised close returns False without transition or audit write.

## 8. Runtime hygiene
Status: APPLIES
Reason: close path now matches cancel/reopen/no-show authorisation hygiene.
