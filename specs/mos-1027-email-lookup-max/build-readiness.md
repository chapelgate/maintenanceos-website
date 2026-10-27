# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed blank/overlong resident_by_email lookup before SessionLocal opens.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early checks; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging or worker changes in this slice.

## 5. Security
Status: APPLIES
Reason: overlong email lookup rejected before session or resident query.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-email-lookup-max/; ready PR; rollback by reverting slice commit.

## 7. Operations
Status: APPLIES
Reason: None return on invalid email keeps lookup path fail-closed.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid email lookups never open a database session.
