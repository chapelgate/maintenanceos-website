# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed overlong phone normalisation before resident lookup session opens.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early length checks; no new queries, caches, or indexes added.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation helper only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging provider or worker behaviour changes in this slice.

## 5. Security
Status: APPLIES
Reason: overlong phone values rejected before session and resident query.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-phone-normalise-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: empty normalised phone keeps resident_by_phone fail-closed with None.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid phones never open a database session via resident_by_phone.
